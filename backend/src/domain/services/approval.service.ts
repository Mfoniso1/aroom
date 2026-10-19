// ==============================================================================
// Aroom: Agent / Landlord Approval Service (Team Leader workflow)
// ==============================================================================

import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { db } from '../../db/store.js';
import { AgentKind, AgentProfile, User } from '../entities/types.js';
import { NotificationService } from './notification.service.js';
import { normalizePhone } from './identity.service.js';
import { resolveIdCardUrl } from './storage.service.js';

export type ApprovalFilter = 'pending' | 'approved' | 'rejected' | 'suspended' | 'all';

const notifications = new NotificationService();

function statusOf(user: User): 'pending' | 'approved' | 'rejected' | 'suspended' {
  switch (user.accountStatus) {
    case 'active':
      return 'approved';
    case 'rejected':
      return 'rejected';
    case 'suspended':
      return 'suspended';
    default:
      return 'pending';
  }
}

async function toReviewDto(profile: AgentProfile, user: User, includeIdCard: boolean) {
  const base = {
    agentProfileId: profile.id,
    userId: user.id,
    fullName: profile.fullName,
    agencyName: profile.agencyName ?? null,
    phoneNumber: user.phoneNumber,
    agentKind: profile.agentKind,
    status: statusOf(user),
    phoneContacted: profile.phoneContacted,
    rejectionReason: profile.rejectionReason ?? null,
    reviewedBy: profile.reviewedBy ?? null,
    reviewedAt: profile.reviewedAt ?? null,
    createdAt: profile.createdAt,
    listingCount: Array.from(db.listings.values()).filter((l) => l.agentId === profile.id).length,
  };
  if (!includeIdCard) return base;
  return { ...base, idCardImageUrl: await resolveIdCardUrl(profile.idCardImageUrl) };
}

export class ApprovalService {
  private getPair(agentProfileId: string) {
    const profile = db.agentProfiles.get(agentProfileId);
    if (!profile) throw new Error('Agent application not found.');
    const user = db.users.get(profile.userId);
    if (!user) throw new Error('Agent user not found.');
    return { profile, user };
  }

  public async list(filter: ApprovalFilter = 'pending') {
    const rows: Awaited<ReturnType<typeof toReviewDto>>[] = [];
    for (const profile of db.agentProfiles.values()) {
      const user = db.users.get(profile.userId);
      if (!user) continue;
      if (filter !== 'all' && statusOf(user) !== filter) continue;
      rows.push(await toReviewDto(profile, user, false));
    }
    rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const counts = { pending: 0, approved: 0, rejected: 0, suspended: 0 };
    for (const p of db.agentProfiles.values()) {
      const u = db.users.get(p.userId);
      if (u) counts[statusOf(u)] += 1;
    }
    return { counts, items: rows };
  }

  public async getForReview(agentProfileId: string) {
    const { profile, user } = this.getPair(agentProfileId);
    return toReviewDto(profile, user, true);
  }

  public async approve(agentProfileId: string, reviewerId: string, phoneContacted?: boolean) {
    const { profile, user } = this.getPair(agentProfileId);
    const before = { status: statusOf(user) };

    user.accountStatus = 'active';
    user.updatedAt = new Date();
    profile.reviewedBy = reviewerId;
    profile.reviewedAt = new Date();
    profile.rejectionReason = undefined;
    if (phoneContacted !== undefined) profile.phoneContacted = phoneContacted;
    // Pilot: the Team Leader's manual check replaces OTP, so mark the phone as verified.
    profile.isPhoneVerified = true;

    db.recordAudit('agent_profile', profile.id, 'APPROVE_AGENT', reviewerId, before, { status: 'approved' });
    notifications.notify(
      user.id,
      'agent_approved',
      'You are approved!',
      'The Aroom team has approved your account. You can now list properties.'
    );
    return toReviewDto(profile, user, false);
  }

  public async reject(agentProfileId: string, reviewerId: string, reason: string) {
    const { profile, user } = this.getPair(agentProfileId);
    const before = { status: statusOf(user) };

    user.accountStatus = 'rejected';
    user.updatedAt = new Date();
    profile.reviewedBy = reviewerId;
    profile.reviewedAt = new Date();
    profile.rejectionReason = reason;

    db.recordAudit('agent_profile', profile.id, 'REJECT_AGENT', reviewerId, before, { status: 'rejected', reason });
    notifications.notify(user.id, 'agent_rejected', 'Application not approved', reason);
    return toReviewDto(profile, user, false);
  }

  public async suspend(agentProfileId: string, reviewerId: string, reason?: string) {
    const { profile, user } = this.getPair(agentProfileId);
    const before = { status: statusOf(user) };

    user.accountStatus = 'suspended';
    user.updatedAt = new Date();
    profile.reviewedBy = reviewerId;
    profile.reviewedAt = new Date();
    profile.rejectionReason = reason;

    db.recordAudit('agent_profile', profile.id, 'SUSPEND_AGENT', reviewerId, before, { status: 'suspended', reason });
    return toReviewDto(profile, user, false);
  }

  public async reinstate(agentProfileId: string, reviewerId: string) {
    return this.approve(agentProfileId, reviewerId);
  }

  public async setPhoneContacted(agentProfileId: string, reviewerId: string, value: boolean) {
    const { profile, user } = this.getPair(agentProfileId);
    profile.phoneContacted = value;
    db.recordAudit('agent_profile', profile.id, 'SET_PHONE_CONTACTED', reviewerId, undefined, { value });
    return toReviewDto(profile, user, false);
  }

  /** Team Leader adds a known agent/landlord directly (pre-approved). */
  public async createApproved(
    reviewerId: string,
    input: { fullName: string; phoneNumber: string; password: string; agentKind: AgentKind; agencyName?: string }
  ) {
    const phone = normalizePhone(input.phoneNumber);
    if (Array.from(db.users.values()).some((u) => u.phoneNumber === phone)) {
      throw new Error(`Phone number already registered: ${phone}`);
    }

    const userId = uuidv4();
    const profileId = uuidv4();
    const user: User = {
      id: userId,
      phoneNumber: phone,
      passwordHash: await bcrypt.hash(input.password, 10),
      userType: 'agent',
      accountStatus: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const profile: AgentProfile = {
      id: profileId,
      userId,
      fullName: input.fullName,
      agencyName: input.agencyName,
      idCardImageUrl: 'added-by-team-leader',
      isPhoneVerified: true,
      trustTier: 'bronze',
      trustScore: 50,
      totalInspections: 0,
      successfulDeals: 0,
      noShowCount: 0,
      responseRatePct: 100,
      agentKind: input.agentKind,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      phoneContacted: true,
      createdAt: new Date(),
    };
    db.users.set(userId, user);
    db.agentProfiles.set(profileId, profile);

    db.recordAudit('agent_profile', profileId, 'CREATE_APPROVED_AGENT', reviewerId, undefined, {
      fullName: input.fullName,
      agentKind: input.agentKind,
    });
    return toReviewDto(profile, user, false);
  }
}

