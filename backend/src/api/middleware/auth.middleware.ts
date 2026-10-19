// ==============================================================================
// Aroom: Auth middleware (JWT) and role guards
// ==============================================================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../../db/store.js';
import { UserType } from '../../domain/entities/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-me';
const JWT_EXPIRES_IN = '7d';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be set in production.');
}

export interface AuthUser {
  id: string;
  userType: UserType;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

export function signToken(user: AuthUser): string {
  return jwt.sign({ sub: user.id, role: user.userType }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

class HttpError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

/** Requires a valid Bearer token. Loads the user fresh so suspensions apply immediately. */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return next(new HttpError(401, 'Authentication required.'));

  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    const user = db.users.get(String(payload.sub));
    if (!user) return next(new HttpError(401, 'Account not found.'));
    if (user.accountStatus === 'suspended') return next(new HttpError(403, 'This account has been suspended.'));
    req.user = { id: user.id, userType: user.userType };
    next();
  } catch {
    next(new HttpError(401, 'Session expired. Please log in again.'));
  }
}

export function requireRole(...roles: UserType[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new HttpError(401, 'Authentication required.'));
    if (!roles.includes(req.user.userType)) {
      return next(new HttpError(403, 'You do not have permission to do this.'));
    }
    next();
  };
}

