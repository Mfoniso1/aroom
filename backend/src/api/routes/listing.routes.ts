import { Router, Request, Response, NextFunction } from 'express';
import { ListingService } from '../../domain/services/listing.service.js';
import { SearchListingsQuerySchema, CreateListingBodySchema, UpdateListingStatusSchema } from '../dtos/schemas.js';
import { db } from '../../db/store.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

export const listingRouter = Router();
const listingService = new ListingService();

/**
 * GET /api/v1/listings/search
 * Search listings across campus, budget, room type, verification status
 */
listingRouter.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = SearchListingsQuerySchema.parse(req.query);

    const results = await listingService.search({
      campusId: validated.campus_id,
      campusShortCode: validated.campus_code,
      minBudgetKobo: validated.min_budget ? validated.min_budget * 100 : undefined,
      maxBudgetKobo: validated.max_budget ? validated.max_budget * 100 : undefined,
      roomType: validated.room_type,
      onlyVerified: validated.only_verified,
      status: validated.status,
      limit: validated.limit,
      offset: validated.offset,
    });

    res.json({
      success: true,
      data: results,
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/listings/mine
 * The logged-in agent's own listings (dashboard).
 */
listingRouter.get('/mine', requireAuth, requireRole('agent'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agentProfile = Array.from(db.agentProfiles.values()).find((a) => a.userId === req.user!.id);
    const items = await listingService.listByAgent(agentProfile?.id ?? '');
    res.json({ success: true, data: items, error: null });
  } catch (err) {
    next(err);
  }
});
/**
 * GET /api/v1/listings/:id
 * Detailed listing information with trust signals
 */
listingRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const listingId = String(req.params.id);
    const listing = await listingService.getById(listingId);
    res.json({
      success: true,
      data: listing,
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/listings
 * Fast agent listing creation. Goes live immediately as 'unverified_new'.
 */
listingRouter.post('/', requireAuth, requireRole('agent'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = CreateListingBodySchema.parse(req.body);

    const actorUserId = req.user!.id;
    const agentProfile = Array.from(db.agentProfiles.values()).find((a) => a.userId === actorUserId);

    if (!agentProfile) {
      res.status(403).json({
        success: false,
        data: null,
        error: 'Only registered and verified agents can create listings.',
      });
      return;
    }

    const newListing = await listingService.createListing(agentProfile.id, {
      ...validated,
      moveInDate: new Date(validated.moveInDate),
    });

    res.status(201).json({
      success: true,
      data: newListing,
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/listings/:id/status
 * Single-tap toggle for available / held / taken.
 */
listingRouter.patch('/:id/status', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = UpdateListingStatusSchema.parse(req.body);
    const actorUserId = req.user!.id;

    const listingId = String(req.params.id);
    const updated = await listingService.updateAvailability(
      listingId,
      actorUserId,
      validated.status,
      validated.reason
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
 * POST /api/v1/listings/:id/request-verification
 * Prompt/request for listing physical spot-check badge upgrade.
 */
listingRouter.post('/:id/request-verification', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const actorUserId = req.user!.id;
    const listingId = String(req.params.id);
    const result = await listingService.requestVerification(listingId, actorUserId);
    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (err) {
    next(err);
  }
});
