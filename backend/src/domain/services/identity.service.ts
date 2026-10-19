// ==============================================================================
// Aroom: Identity & Verification Domain Service
// Handles student onboarding, institutional domain matching, agent phone OTP & ID review
// ==============================================================================

import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { db } from '../../db/store.js';
import { User, StudentProfile, AgentProfile, AgentKind } from '../entities/types.js';
import { signToken } from '../../api/middleware/auth.middleware.js';
import { NotificationService } from './notification.service.js';

const notifications = new NotificationService();

/** Normalises Nigerian numbers: 0801 234 5678 / 234801... / +234801... -> +234801... */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.startsWith('234')) return `+${digits}`;
  if (digits.startsWith('0')) return `+234${digits.slice(1)}`;
  return `+${digits}`;
}

export interface RegisterAgentInput {
  phoneNumber: string;
  email?: string;
  password: string;
  fullName: string;
  agentKind: AgentKind;
  agencyName?: string;
  idCardImageUrl: string;
}

export interface RegisterStudentInput {
  phoneNumber: string;
  campusId: string;
  email?: string;
  matricNumber?: string;
  studentIdImageUrl?: string;
}

export class IdentityService {
  /**
   * Pilot onboarding: agents/landlords sign up with phone + password + ID photo.
   * No OTP: the Team Leader reviews every applicant manually. The account stays
   * `pending_verification` until approved, and the Team Leader is notified.
   */
  public async registerAgent(input: RegisterAgentInput) {
    const phoneNumber = normalizePhone(input.phoneNumber);

    const existing = Array.from(db.users.values()).find((u) => u.phoneNumber === phoneNumber);
    if (existing) {
      throw new Error(`Phone number already registered: ${phoneNumber}`);
    }

    const email = input.email?.trim().toLowerCase() || undefined;
    if (email && Array.from(db.users.values()).some((u) => u.email?.toLowerCase() === email)) {
      throw new Error(`Email already registered: ${email}`);
    }

    const userId = uuidv4();
    const agentProfileId = uuidv4();

    const newUser: User = {
      id: userId,
      phoneNumber,
      email,
      passwordHash: await bcrypt.hash(input.password, 10),
      userType: 'agent',
      accountStatus: 'pending_verification',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newProfile: AgentProfile = {
      id: agentProfileId,
      userId,
      fullName: input.fullName,
      agencyName: input.agencyName,
      idCardImageUrl: input.idCardImageUrl,
      isPhoneVerified: false, // set to true by the Team Leader on approval
      trustTier: 'bronze',
      trustScore: 50.0,
      totalInspections: 0,
      successfulDeals: 0,
      noShowCount: 0,
      responseRatePct: 100.0,
      agentKind: input.agentKind,
      phoneContacted: false,
      createdAt: new Date(),
    };

    db.users.set(userId, newUser);
    db.agentProfiles.set(agentProfileId, newProfile);

    db.recordAudit('user', userId, 'REGISTER_AGENT', userId, undefined, {
      fullName: input.fullName,
      agentKind: input.agentKind,
      status: 'pending_verification',
    });

    notifications.notifyAdmins(
      'agent_signup',
      'New agent signup',
      `${input.fullName} (${input.agentKind}) is waiting for approval.`,
      { agentProfileId, userId }
    );

    return {
      userId,
      agentProfileId,
      status: 'pending' as const,
      token: signToken({ id: userId, userType: 'agent' }),
      message: 'Application received. The Aroom team will review and approve your account.',
    };
  }

  /**
   * Phone-or-email + password login for agents, landlords and the Team Leader.
   */
  public async login(identifier: string, password: string) {
    const id = identifier.trim();
    const user = id.includes('@')
      ? Array.from(db.users.values()).find((u) => u.email?.toLowerCase() === id.toLowerCase())
      : Array.from(db.users.values()).find((u) => u.phoneNumber === normalizePhone(id));
    // Same message for unknown phone and wrong password (no account enumeration)
    const invalid = new Error('Incorrect phone number or password.');
    (invalid as any).statusCode = 401;
    if (!user || !user.passwordHash) throw invalid;
    if (!(await bcrypt.compare(password, user.passwordHash))) throw invalid;
    if (user.accountStatus === 'suspended') {
      const e = new Error('This account has been suspended. Please contact the Aroom team.');
      (e as any).statusCode = 403;
      throw e;
    }

    return {
      token: signToken({ id: user.id, userType: user.userType }),
      me: this.me(user.id),
    };
  }

  /**
   * Current session: role + approval status (drives route guards in the web app).
   */
  public me(userId: string) {
    const user = db.users.get(userId);
    if (!user) throw new Error('User not found.');
    const profile = Array.from(db.agentProfiles.values()).find((p) => p.userId === userId);

    let approvalStatus: 'approved' | 'pending' | 'rejected' | 'suspended' | null = null;
    if (user.userType === 'agent') {
      approvalStatus =
        user.accountStatus === 'active'
          ? 'approved'
          : user.accountStatus === 'rejected'
          ? 'rejected'
          : user.accountStatus === 'suspended'
          ? 'suspended'
          : 'pending';
    }

    return {
      id: user.id,
      role: user.userType,
      phoneNumber: user.phoneNumber,
      fullName: profile?.fullName ?? (user.userType === 'admin' ? 'Team Leader' : null),
      agentProfileId: profile?.id ?? null,
      agentKind: profile?.agentKind ?? null,
      approvalStatus,
      rejectionReason: user.accountStatus === 'rejected' ? profile?.rejectionReason ?? null : null,
    };
  }

  /**
   * Post-pilot: phone OTP verification (kept for the open-signup phase; unused in the pilot).
   */
  public async verifyAgentOtp(phoneNumber: string, otp: string) {
    const user = Array.from(db.users.values()).find((u) => u.phoneNumber === normalizePhone(phoneNumber));
    if (!user) {
      throw new Error(`Agent user not found for phone: ${phoneNumber}`);
    }

    const profile = Array.from(db.agentProfiles.values()).find((p) => p.userId === user.id);
    if (!profile) {
      throw new Error('Agent profile not found.');
    }

    // Validate OTP (Accept '123456' for MVP / mock)
    if (otp !== '123456') {
      throw new Error('Invalid OTP provided.');
    }

    profile.isPhoneVerified = true;
    profile.trustScore = Math.min(100, profile.trustScore + 10); // Reward phone verification

    db.recordAudit('agent_profile', profile.id, 'VERIFY_PHONE_OTP', user.id);

    return {
      success: true,
      message: 'Phone number verified.',
      agentProfile: profile,
    };
  }

  /**
   * Onboard Student with Institutional Email Domain Matching.
   */
  public async registerStudent(input: RegisterStudentInput) {
    const campus = db.campuses.get(input.campusId);
    if (!campus) {
      throw new Error(`Campus not found with ID: ${input.campusId}`);
    }

    // Check existing phone
    let user = Array.from(db.users.values()).find((u) => u.phoneNumber === input.phoneNumber);
    if (!user) {
      const userId = uuidv4();
      user = {
        id: userId,
        phoneNumber: input.phoneNumber,
        email: input.email,
        userType: 'student',
        accountStatus: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.users.set(userId, user);
    }

    // Automated Domain Matching against known institutional email domains
    let isInstitutionVerified = false;
    if (input.email) {
      const emailLower = input.email.toLowerCase();
      const matchesCampusDomain = campus.institutionalEmailDomains.some((domain: string) =>
        emailLower.endsWith(domain.toLowerCase())
      );
      if (matchesCampusDomain) {
        isInstitutionVerified = true;
      }
    }

    // If student ID photo is supplied, mark for instant or pending verification
    if (input.studentIdImageUrl) {
      isInstitutionVerified = true;
    }

    const studentProfileId = uuidv4();
    const studentProfile: StudentProfile = {
      id: studentProfileId,
      userId: user.id,
      campusId: input.campusId,
      matricNumber: input.matricNumber,
      institutionalEmail: input.email,
      studentIdImageUrl: input.studentIdImageUrl,
      isInstitutionVerified,
      verifiedAt: isInstitutionVerified ? new Date() : undefined,
    };

    db.studentProfiles.set(studentProfileId, studentProfile);

    db.recordAudit('student_profile', studentProfileId, 'REGISTER_STUDENT', user.id, undefined, {
      isInstitutionVerified,
    });

    return {
      userId: user.id,
      studentProfileId,
      isInstitutionVerified,
      message: isInstitutionVerified
        ? 'Institutional student status verified automatically!'
        : 'Student registered. Verify your university email to unlock verified status.',
    };
  }

  /**
   * Onboard Non-Student User
   */
  public async registerNonStudent(phoneNumber: string, email?: string) {
    const userId = uuidv4();
    const user: User = {
      id: userId,
      phoneNumber,
      email,
      userType: 'non_student',
      accountStatus: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    db.users.set(userId, user);

    return {
      userId,
      userType: 'non_student',
      message: 'User registered as non-student accommodation seeker.',
    };
  }
}
