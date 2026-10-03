import { Router, Request, Response } from 'express';
import { db } from '../../db/store.js';

export const campusRouter = Router();

/**
 * GET /api/v1/campuses
 * Returns supported campuses and their search landmarks.
 */
campusRouter.get('/', async (_req: Request, res: Response) => {
  const campuses = Array.from(db.campuses.values());
  res.json({
    success: true,
    data: campuses,
    error: null,
  });
});
