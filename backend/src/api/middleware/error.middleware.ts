import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: any, _req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ZodError || err?.name === 'ZodError') {
    const issues = (err as any).issues || (err as any).errors || [];
    const errorMessages = issues
      .map((e: any) => `${e.path ? e.path.join('.') : 'field'}: ${e.message}`)
      .join(', ');
    res.status(400).json({
      success: false,
      data: null,
      error: `Validation error: ${errorMessages}`,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const statusCode = err.statusCode || (err.message && err.message.includes('not found') ? 404 : 400);

  res.status(statusCode).json({
    success: false,
    data: null,
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString(),
  });
}
