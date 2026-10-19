import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { campusRouter } from './api/routes/campus.routes.js';
import { authRouter } from './api/routes/auth.routes.js';
import { listingRouter } from './api/routes/listing.routes.js';
import { inquiryRouter } from './api/routes/inquiry.routes.js';
import { reportRouter } from './api/routes/report.routes.js';
import { webhookRouter } from './api/routes/webhook.routes.js';
import { adminRouter, notificationRouter } from './api/routes/admin.routes.js';
import { errorHandler } from './api/middleware/error.middleware.js';

export function createApp(): Application {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '8mb' })); // ID photo uploads arrive as base64

  // Health check
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      service: 'aroom-backend-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // REST API v1 Routes
  app.use('/api/v1/campuses', campusRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/listings', listingRouter);
  app.use('/api/v1/inquiries', inquiryRouter);
  app.use('/api/v1/reports', reportRouter);
  app.use('/api/v1/webhooks', webhookRouter);
  app.use('/api/v1/admin', adminRouter);
  app.use('/api/v1/notifications', notificationRouter);

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
}
