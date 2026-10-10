import { Router, Request, Response, NextFunction } from 'express';
import { TrustService } from '../../domain/services/trust.service.js';
import { SubmitReportBodySchema } from '../dtos/schemas.js';

export const reportRouter = Router();
const trustService = new TrustService();

/**
 * POST /api/v1/reports/availability
 * Crowdsourced availability report from student
 */
reportRouter.post('/availability', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = SubmitReportBodySchema.parse(req.body);
    const reporterUserId = (req.headers['x-user-id'] as string) || 'd3333333-3333-3333-3333-333333333333';

    const report = await trustService.submitAvailabilityReport({
      listingId: validated.listingId,
      reporterUserId,
      reportedStatus: validated.reportedStatus,
      comments: validated.comments,
    });

    res.status(201).json({
      success: true,
      data: report,
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/reports/queue
 * Moderator dispute and review queue
 */
reportRouter.get('/queue', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const queue = await trustService.getUnresolvedReports();
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
 * PATCH /api/v1/reports/:id/resolve
 * Moderator decision resolution
 */
reportRouter.patch('/:id/resolve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const moderatorUserId = (req.headers['x-user-id'] as string) || 'admin-user-id';
    const { enforcedStatus } = req.body;
    const reportId = String(req.params.id);
    const result = await trustService.resolveReport(reportId, moderatorUserId, enforcedStatus);
    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (err) {
    next(err);
  }
});
