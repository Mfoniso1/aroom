import { Router, Request, Response, NextFunction } from 'express';
import { IdentityService } from '../../domain/services/identity.service.js';
import { AgentSignupBodySchema, VerifyOtpBodySchema, StudentSignupBodySchema } from '../dtos/schemas.js';

export const authRouter = Router();
const identityService = new IdentityService();

/**
 * POST /api/v1/auth/agent/signup
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
 * POST /api/v1/auth/agent/verify-otp
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
