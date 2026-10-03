import { Router, Request, Response, NextFunction } from 'express';
import { InquiryService } from '../../domain/services/inquiry.service.js';
import { CreateInquiryBodySchema, SubmitFeedbackBodySchema } from '../dtos/schemas.js';

export const inquiryRouter = Router();
const inquiryService = new InquiryService();

/**
 * POST /api/v1/inquiries
 * Universal inquiry & inspection booking handler (invoked by both Web and WhatsApp Bot)
 */
inquiryRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = CreateInquiryBodySchema.parse(req.body);
    const studentUserId = (req.headers['x-user-id'] as string) || 'u3333333-3333-3333-3333-333333333333';

    const newInquiry = await inquiryService.createInquiry({
      listingId: validated.listingId,
      studentUserId,
      sourceChannel: validated.sourceChannel,
      inspectionSlot: validated.inspectionSlot ? new Date(validated.inspectionSlot) : undefined,
      studentNote: validated.studentNote,
    });

    res.status(201).json({
      success: true,
      data: newInquiry,
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/inquiries/agent-queue
 * Qualified leads queue for agents
 */
inquiryRouter.get('/agent-queue', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agentUserId = (req.headers['x-user-id'] as string) || 'u1111111-1111-1111-1111-111111111111';
    const queue = await inquiryService.getAgentInquiries(agentUserId);
    res.json({
      success: true,
      data: queue,
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/inquiries/:id/status
 * Schedule or update appointment status
 */
inquiryRouter.patch('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actorUserId = (req.headers['x-user-id'] as string) || 'u1111111-1111-1111-1111-111111111111';
    const { status, inspectionSlot, agentNote } = req.body;

    const inquiryId = String(req.params.id);
    const updated = await inquiryService.updateInquiryStatus(
      inquiryId,
      actorUserId,
      status,
      inspectionSlot ? new Date(inspectionSlot) : undefined,
      agentNote
    );

    res.json({
      success: true,
      data: updated,
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/inquiries/feedback
 * Post-contact rating and availability flag survey
 */
inquiryRouter.post('/feedback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = SubmitFeedbackBodySchema.parse(req.body);
    const studentUserId = (req.headers['x-user-id'] as string) || 'u3333333-3333-3333-3333-333333333333';

    const review = await inquiryService.submitInspectionFeedback({
      inquiryId: validated.inquiryId,
      studentUserId,
      ratingStars: validated.ratingStars,
      visitedProperty: validated.visitedProperty,
      accuratelyDescribed: validated.accuratelyDescribed,
      agentShowedUp: validated.agentShowedUp,
      isRoomStillAvailable: validated.isRoomStillAvailable,
      reviewNotes: validated.reviewNotes,
    });

    res.status(201).json({
      success: true,
      data: review,
      error: null,
    });
  } catch (err) {
    next(err);
  }
});
