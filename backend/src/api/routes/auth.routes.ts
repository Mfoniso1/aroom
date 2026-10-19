import { Router, Request, Response, NextFunction } from 'express';
import { IdentityService } from '../../domain/services/identity.service.js';
import {
  AgentSignupBodySchema,
  VerifyOtpBodySchema,
  StudentSignupBodySchema,
  LoginBodySchema,
  UploadIdBodySchema,
} from '../dtos/schemas.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { storeIdCard } from '../../domain/services/storage.service.js';

export const authRouter = Router();
const identityService = new IdentityService();

// Minimal in-memory brute-force guard: 10 failed logins per phone+IP per 15 minutes.
const failedLogins = new Map<string, { count: number; resetAt: number }>();
const MAX_FAILED = 10;
const WINDOW_MS = 15 * 60 * 1000;

function loginKey(req: Request, phone: string) {
  return `${req.ip}|${phone}`;
}

/**
 * POST /api/v1/auth/upload-id
 * Stores the agent's ID photo and returns a reference to send with signup.
 * Public (needed before an account exists); size and type are validated.
 */
authRouter.post('/upload-id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = UploadIdBodySchema.parse(req.body);
    const idCardImageUrl = await storeIdCard(validated.contentType, validated.dataBase64);
    res.status(201).json({ success: true, data: { idCardImageUrl }, error: null });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/agent/signup
 * Pilot: no OTP. Account is created as pending and the Team Leader is notified.
 */
authRouter.post('/agent/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = AgentSignupBodySchema.parse(req.body);
    const result = await identityService.registerAgent(validated);
    res.status(201).json({
      success: true,
      data: result,
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/login
 * Phone + password. Returns a JWT and the session summary.
 */
authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = LoginBodySchema.parse(req.body);
    const key = loginKey(req, validated.identifier.toLowerCase());
    const entry = failedLogins.get(key);
    if (entry && entry.resetAt > Date.now() && entry.count >= MAX_FAILED) {
      const e: any = new Error('Too many failed attempts. Try again in a few minutes.');
      e.statusCode = 429;
      throw e;
    }

    try {
      const result = await identityService.login(validated.identifier, validated.password);
      failedLogins.delete(key);
      res.json({ success: true, data: result, error: null });
    } catch (err) {
      const current = entry && entry.resetAt > Date.now() ? entry : { count: 0, resetAt: Date.now() + WINDOW_MS };
      current.count += 1;
      failedLogins.set(key, current);
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/auth/me
 * Role and approval status for the logged-in user.
 */
authRouter.get('/me', requireAuth, (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, data: identityService.me(req.user!.id), error: null });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/agent/verify-otp
 * Dormant in the pilot (Team Leader approval replaces OTP). Kept for open signup later.
 */
authRouter.post('/agent/verify-otp', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = VerifyOtpBodySchema.parse(req.body);
    const result = await identityService.verifyAgentOtp(validated.phoneNumber, validated.otp);
    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/student/signup
 */
authRouter.post('/student/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = StudentSignupBodySchema.parse(req.body);
    const result = await identityService.registerStudent(validated);
    res.status(201).json({
      success: true,
      data: result,
      error: null,
    });
  } catch (err) {
    next(err);
  }
});
