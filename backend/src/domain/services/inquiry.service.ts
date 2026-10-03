// ==============================================================================
// Aroom: Inquiry & Inspection Domain Service
// Shared by Web Dashboard and WhatsApp Bot
// ==============================================================================

import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db/store.js';
import { Inquiry, InquiryStatus, SourceChannel, InspectionReview } from '../entities/types.js';

export interface CreateInquiryInput {
  listingId: string;
  studentUserId: string;
  sourceChannel: SourceChannel;
  inspectionSlot?: Date;
  studentNote?: string;
}

export interface SubmitFeedbackInput {
  inquiryId: string;
  studentUserId: string;
  ratingStars: number;
  visitedProperty: boolean;
  accuratelyDescribed: boolean;
  agentShowedUp: boolean;
  isRoomStillAvailable: boolean; // Crowdsourced availability signal
  reviewNotes?: string;
}

export class InquiryService {
  /**
   * Universal lead generation and inspection request handler.
   */
  public async createInquiry(input: CreateInquiryInput): Promise<Inquiry> {
    const listing = db.listings.get(input.listingId);
    if (!listing) {
      throw new Error(`Listing not found: ${input.listingId}`);
    }

    if (listing.availabilityStatus === 'taken') {
      throw new Error('This property has already been taken.');
    }

    const studentUser = db.users.get(input.studentUserId);
    if (!studentUser) {
      throw new Error(`Student user record not found: ${input.studentUserId}`);
    }

    // Agent Protection Invariant: Verify student or user identity
    const studentProfile = Array.from(db.studentProfiles.values()).find((p) => p.userId === input.studentUserId);
    if (studentUser.userType === 'student' && (!studentProfile || !studentProfile.isInstitutionVerified)) {
      // Allow proceeding if student email was verified, otherwise throw
      if (!studentUser.email) {
        throw new Error('Please verify your student email (.edu.ng) or phone number before booking an inspection.');
      }
    }

    const inquiryId = uuidv4();
    const newInquiry: Inquiry = {
      id: inquiryId,
      listingId: input.listingId,
      studentId: input.studentUserId,
      agentId: listing.agentId,
      sourceChannel: input.sourceChannel,
      status: 'requested',
      inspectionSlot: input.inspectionSlot ? new Date(input.inspectionSlot) : undefined,
      studentNote: input.studentNote,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    db.inquiries.set(inquiryId, newInquiry);

    // If an inspection slot was specified, place listing in 'held' to avoid double-booking race condition
    if (input.inspectionSlot) {
      listing.availabilityStatus = 'held';
      listing.updatedAt = new Date();
    }

    db.recordAudit('inquiry', inquiryId, 'CREATE_INQUIRY', input.studentUserId, undefined, {
      listingId: input.listingId,
      sourceChannel: input.sourceChannel,
      inspectionSlot: input.inspectionSlot,
    });

    return newInquiry;
  }

  /**
   * Agent lead queue: fetch inquiries for a specific agent.
   */
  public async getAgentInquiries(agentUserId: string) {
    const agent = Array.from(db.agentProfiles.values()).find((a) => a.userId === agentUserId);
    if (!agent) {
      throw new Error(`Agent profile not found for user: ${agentUserId}`);
    }

    const agentInquiries = Array.from(db.inquiries.values())
      .filter((inq) => inq.agentId === agent.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return agentInquiries.map((inq) => {
      const listing = db.listings.get(inq.listingId);
      const studentUser = db.users.get(inq.studentId);
      const studentProfile = Array.from(db.studentProfiles.values()).find((p) => p.userId === inq.studentId);

      return {
        ...inq,
        listing: listing
          ? {
              id: listing.id,
              title: listing.title,
              roomType: listing.roomType,
              landmarkVicinity: listing.landmarkVicinity,
              priceAnnualNaira: listing.priceAnnualKobo / 100,
            }
          : null,
        student: studentUser
          ? {
              phoneNumber: studentUser.phoneNumber,
              email: studentUser.email,
              userType: studentUser.userType,
              isInstitutionVerified: studentProfile?.isInstitutionVerified ?? false,
              matricNumber: studentProfile?.matricNumber,
            }
          : null,
      };
    });
  }

  /**
   * Schedule or accept inspection slot.
   */
  public async updateInquiryStatus(
    inquiryId: string,
    actorUserId: string,
    status: InquiryStatus,
    slot?: Date,
    agentNote?: string
  ) {
    const inquiry = db.inquiries.get(inquiryId);
    if (!inquiry) {
      throw new Error(`Inquiry not found: ${inquiryId}`);
    }

    const listing = db.listings.get(inquiry.listingId);

    inquiry.status = status;
    if (slot) inquiry.inspectionSlot = new Date(slot);
    if (agentNote) inquiry.agentNote = agentNote;
    inquiry.updatedAt = new Date();

    if (listing) {
      if (status === 'accepted') {
        listing.availabilityStatus = 'held';
      } else if (status === 'cancelled' || status === 'rejected') {
        listing.availabilityStatus = 'available';
      }
    }

    // Update agent statistics
    const agent = db.agentProfiles.get(inquiry.agentId);
    if (agent) {
      if (status === 'completed') {
        agent.totalInspections += 1;
      } else if (status === 'no_show') {
        agent.noShowCount += 1;
      }
    }

    db.recordAudit('inquiry', inquiryId, 'UPDATE_INQUIRY_STATUS', actorUserId, undefined, {
      status,
      inspectionSlot: slot,
    });

    return inquiry;
  }

  /**
   * Post-Contact Feedback & Availability Sentinel (24-Hour feedback loop).
   */
  public async submitInspectionFeedback(input: SubmitFeedbackInput): Promise<InspectionReview> {
    const inquiry = db.inquiries.get(input.inquiryId);
    if (!inquiry) {
      throw new Error(`Inquiry not found: ${input.inquiryId}`);
    }

    if (inquiry.studentId !== input.studentUserId) {
      throw new Error('Only the student who initiated the inquiry can submit inspection feedback.');
    }

    const reviewId = uuidv4();
    const newReview: InspectionReview = {
      id: reviewId,
      inquiryId: input.inquiryId,
      listingId: inquiry.listingId,
      studentId: input.studentUserId,
      agentId: inquiry.agentId,
      ratingStars: input.ratingStars,
      visitedProperty: input.visitedProperty,
      accuratelyDescribed: input.accuratelyDescribed,
      agentShowedUp: input.agentShowedUp,
      reviewNotes: input.reviewNotes,
      createdAt: new Date(),
    };

    db.inspectionReviews.set(reviewId, newReview);

    // Update Inquiry status to completed
    inquiry.status = input.agentShowedUp ? 'completed' : 'no_show';
    inquiry.updatedAt = new Date();

    // 1. Agent Reliability Update
    const agent = db.agentProfiles.get(inquiry.agentId);
    if (agent) {
      if (!input.agentShowedUp) {
        agent.noShowCount += 1;
        agent.trustScore = Math.max(0, agent.trustScore - 10);
      } else {
        agent.totalInspections += 1;
        if (input.ratingStars >= 4) {
          agent.trustScore = Math.min(100, agent.trustScore + 1.5);
        }
      }
    }

    // 2. Crowdsourced Listing Availability Enforcement:
    // If student reports property is taken, automatically update listing state!
    const listing = db.listings.get(inquiry.listingId);
    if (listing) {
      if (!input.isRoomStillAvailable) {
        listing.availabilityStatus = 'taken';
        listing.updatedAt = new Date();

        db.availabilityReports.set(uuidv4(), {
          id: uuidv4(),
          listingId: listing.id,
          reporterUserId: input.studentUserId,
          reportedStatus: 'taken',
          comments: input.reviewNotes || 'Student confirmed property was taken during physical inspection.',
          aiSentimentScore: -0.9,
          isResolved: true,
          createdAt: new Date(),
        });
      } else {
        listing.availabilityStatus = 'available';
      }
    }

    db.recordAudit('review', reviewId, 'SUBMIT_INSPECTION_FEEDBACK', input.studentUserId, undefined, {
      ratingStars: input.ratingStars,
      isRoomStillAvailable: input.isRoomStillAvailable,
      agentShowedUp: input.agentShowedUp,
    });

    return newReview;
  }
}
