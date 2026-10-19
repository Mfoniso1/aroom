import { Router, Request, Response, NextFunction } from 'express';
import { ApprovalService, ApprovalFilter } from '../../domain/services/approval.service.js';
import { NotificationService } from '../../domain/services/notification.service.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';
import {
  RejectAgentBodySchema,
  ApproveAgentBodySchema,
  SuspendAgentBodySchema,
  PhoneContactedBodySchema,
  CreateApprovedAgentBodySchema,
} from '../dtos/schemas.js';

export const adminRouter = Router();
export const notificationRouter = Router();

const approvals = new ApprovalService();
const notifications = new NotificationService();

const ok = (res: Response, data: unknown, status = 200) =>
  res.status(status).json({ success: true, data, error: null });

// ---- Team Leader (admin) endpoints ------------------------------------------
adminRouter.use(requireAuth, requireRole('admin'));

/** GET /api/v1/admin/agents?status=pending|approved|rejected|suspended|all */
adminRouter.get('/agents', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const allowed = ['pending', 'approved', 'rejected', 'suspended', 'all'];
    const status = String(req.query.status || 'pending');
    if (!allowed.includes(status)) throw new Error('Invalid status filter.');
    ok(res, await approvals.list(status as ApprovalFilter));
  } catch (err) {
    next(err);
  }
});

/** POST /api/v1/admin/agents (add a pre-approved agent/landlord) */
adminRouter.post('/agents', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = CreateApprovedAgentBodySchema.parse(req.body);
    ok(res, await approvals.createApproved(req.user!.id, body), 201);
  } catch (err) {
    next(err);
  }
});

/** GET /api/v1/admin/agents/:id */
adminRouter.get('/agents/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await approvals.getForReview(String(req.params.id)));
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/agents/:id/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = ApproveAgentBodySchema.parse(req.body ?? {});
    ok(res, await approvals.approve(String(req.params.id), req.user!.id, body.phoneContacted));
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/agents/:id/reject', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = RejectAgentBodySchema.parse(req.body);
    ok(res, await approvals.reject(String(req.params.id), req.user!.id, body.reason));
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/agents/:id/suspend', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = SuspendAgentBodySchema.parse(req.body ?? {});
    ok(res, await approvals.suspend(String(req.params.id), req.user!.id, body.reason));
  } catch (err) {
    next(err);
  }
});

adminRouter.post('/agents/:id/reinstate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, await approvals.reinstate(String(req.params.id), req.user!.id));
  } catch (err) {
    next(err);
  }
});

adminRouter.patch('/agents/:id/phone-contacted', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = PhoneContactedBodySchema.parse(req.body);
    ok(res, await approvals.setPhoneContacted(String(req.params.id), req.user!.id, body.value));
  } catch (err) {
    next(err);
  }
});

// ---- Notifications (any logged-in user) -------------------------------------
notificationRouter.use(requireAuth);

notificationRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, notifications.list(req.user!.id));
  } catch (err) {
    next(err);
  }
});

notificationRouter.post('/read-all', (req: Request, res: Response, next: NextFunction) => {
  try {
    notifications.markAllRead(req.user!.id);
    ok(res, { done: true });
  } catch (err) {
    next(err);
  }
});

notificationRouter.post('/:id/read', (req: Request, res: Response, next: NextFunction) => {
  try {
    ok(res, notifications.markRead(req.user!.id, String(req.params.id)));
  } catch (err) {
    next(err);
  }
});

