// ==============================================================================
// Aroom: Trust & Verification Domain Service
// Moderation queue, crowdsourced reports, agent trust scoring
// ==============================================================================

import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db/store.js';
import { AvailabilityStatus, AvailabilityReport } from '../entities/types.js';

export interface SubmitAvailabilityReportInput {
  listingId: string;
  reporterUserId: string;
  reportedStatus: AvailabilityStatus;
  comments: string;
}

export class TrustService {
  /**
   * Submit an availability report (e.g. Student visits room and sees it's already taken).
   */
  public async submitAvailabilityReport(input: SubmitAvailabilityReportInput): Promise<AvailabilityReport> {
    const listing = db.listings.get(input.listingId);
    if (!listing) {
      throw new Error(`Listing not found: ${input.listingId}`);
    }

    const reportId = uuidv4();
    const commentLower = input.comments.toLowerCase();

    // Fast keyword sentiment detection for Nigerian student terms
    const isTakenSignal =
      commentLower.includes('taken') ||
      commentLower.includes('paid') ||
      commentLower.includes('occupied') ||
      commentLower.includes('given out') ||
      commentLower.includes('someone else took it');

    const newReport: AvailabilityReport = {
      id: reportId,
      listingId: input.listingId,
      reporterUserId: input.reporterUserId,
      reportedStatus: input.reportedStatus,
      comments: input.comments,
      aiSentimentScore: isTakenSignal ? -0.85 : 0.0,
      isResolved: false,
      createdAt: new Date(),
    };

    db.availabilityReports.set(reportId, newReport);

    // If report says taken and multiple reports exist or strong signal, automatically mark held
    if (isTakenSignal && input.reportedStatus === 'taken') {
      listing.availabilityStatus = 'held'; // Hold for review so other students don't waste time
      listing.updatedAt = new Date();
    }

    db.recordAudit('report', reportId, 'SUBMIT_AVAILABILITY_REPORT', input.reporterUserId, undefined, {
      reportedStatus: input.reportedStatus,
      isTakenSignal,
    });

    return newReport;
  }

  /**
   * Admin / Moderator Queue: Fetch unresolved availability disputes.
   */
  public async getUnresolvedReports() {
    return Array.from(db.availabilityReports.values())
      .filter((r) => !r.isResolved)
      .map((r) => {
        const listing = db.listings.get(r.listingId);
        const reporter = db.users.get(r.reporterUserId);
        return {
          ...r,
          listing: listing
            ? {
                id: listing.id,
                title: listing.title,
                currentStatus: listing.availabilityStatus,
                landmarkVicinity: listing.landmarkVicinity,
              }
            : null,
          reporter: reporter
            ? {
                phoneNumber: reporter.phoneNumber,
                userType: reporter.userType,
              }
            : null,
        };
      });
  }

  /**
   * Moderator Action: Resolve dispute and force listing status.
   */
  public async resolveReport(reportId: string, moderatorUserId: string, enforcedStatus: AvailabilityStatus) {
    const report = db.availabilityReports.get(reportId);
    if (!report) {
      throw new Error(`Report not found: ${reportId}`);
    }

    const listing = db.listings.get(report.listingId);
    if (listing) {
      listing.availabilityStatus = enforcedStatus;
      listing.updatedAt = new Date();
    }

    report.isResolved = true;

    db.recordAudit('report', reportId, 'RESOLVE_AVAILABILITY_REPORT', moderatorUserId, undefined, {
      enforcedStatus,
    });

    return { message: `Report resolved. Listing availability set to ${enforcedStatus}.` };
  }
}
