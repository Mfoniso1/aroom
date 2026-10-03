// ==============================================================================
// Aroom: Identity & Verification Domain Service
// Handles student onboarding, institutional domain matching, agent phone OTP & ID review
// ==============================================================================

import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db/store.js';
import { User, StudentProfile, AgentProfile } from '../entities/types.js';

export interface RegisterAgentInput {
  phoneNumber: string;
  fullName: string;
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
   * Onboard Agent: Instant registration, sends phone OTP.
   */
  public async registerAgent(input: RegisterAgentInput) {
    // Check if phone already registered
    const existing = Array.from(db.users.values()).find((u) => u.phoneNumber === input.phoneNumber);
    if (existing) {
      throw new Error(`Phone number already registered: ${input.phoneNumber}`);
    }

    const userId = uuidv4();
    const agentProfileId = uuidv4();

    const newUser: User = {
      id: userId,
      phoneNumber: input.phoneNumber,
      userType: 'agent',
      accountStatus: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newProfile: AgentProfile = {
      id: agentProfileId,
      userId,
      fullName: input.fullName,
      agencyName: input.agencyName,
      idCardImageUrl: input.idCardImageUrl,
      isPhoneVerified: false, // Must verify OTP
      trustTier: 'bronze',
      trustScore: 50.0,
      totalInspections: 0,
      successfulDeals: 0,
      noShowCount: 0,
      responseRatePct: 100.0,
      createdAt: new Date(),
    };

    db.users.set(userId, newUser);
    db.agentProfiles.set(agentProfileId, newProfile);

    // In a live environment, dispatch SMS OTP via Termii/Twilio
    // For local development and testing, mock OTP is 123456
    const mockOtp = '123456';

    db.recordAudit('user', userId, 'REGISTER_AGENT', userId, undefined, {
      fullName: input.fullName,
      trustTier: 'bronze',
    });

    return {
      userId,
      agentProfileId,
      message: 'Agent registered successfully. Enter OTP sent to your phone to verify account.',
      devOtpHint: mockOtp,
    };
  }

  /**
   * Verify Agent OTP.
   */
  public async verifyAgentOtp(phoneNumber: string, otp: string) {
    const user = Array.from(db.users.values()).find((u) => u.phoneNumber === phoneNumber);
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
      message: 'Phone number verified. Agent account is fully active.',
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
