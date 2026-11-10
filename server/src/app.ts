import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/auth.routes';
import businessRoutes from './routes/business.routes';
import productRoutes from './routes/product.routes';
import inventoryRoutes from './routes/inventory.routes';
import orderRoutes from './routes/order.routes';
import customerRoutes from './routes/customer.routes';
import reportRoutes from './routes/report.routes';
import offerRoutes from './routes/offer.routes';
import notificationRoutes from './routes/notification.routes';
import binRoutes from './routes/bin.routes';
import uploadRoutes from './routes/upload.routes';
import categoryRoutes from './routes/category.routes';
import { errorHandler } from './middlewares/errorHandler';

export const createApp = (): Application => {
  const app = express();

  // CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow all origins in production & development for API flexibility
        callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static uploads directory (supports Vercel /tmp or local uploads)
  const uploadsPath = process.env.VERCEL
    ? path.join('/tmp', 'uploads')
    : path.join(process.cwd(), 'uploads');

  if (!fs.existsSync(uploadsPath)) {
    try {
      fs.mkdirSync(uploadsPath, { recursive: true });
    } catch {}
  }
  app.use('/uploads', express.static(uploadsPath));
  app.use('/api/uploads', express.static(uploadsPath));

  // Health check endpoints
  const handleHealth = (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Digital Kirana API Engine',
      environment: process.env.NODE_ENV || 'production',
      vercel: Boolean(process.env.VERCEL),
      timestamp: new Date().toISOString(),
    });
  };

  app.get('/api/health', handleHealth);
  app.get('/health', handleHealth);

  // Mount routes for both /api/* and /* (supports direct Vercel serverless functions & local proxy)
  const registerRoutes = (prefix = '') => {
    app.use(`${prefix}/auth`, authRoutes);
    app.use(`${prefix}/business`, businessRoutes);
    app.use(`${prefix}/products`, productRoutes);
    app.use(`${prefix}/inventory`, inventoryRoutes);
    app.use(`${prefix}/orders`, orderRoutes);
    app.use(`${prefix}/customers`, customerRoutes);
    app.use(`${prefix}/reports`, reportRoutes);
    app.use(`${prefix}/offers`, offerRoutes);
    app.use(`${prefix}/notifications`, notificationRoutes);
    app.use(`${prefix}/bin`, binRoutes);
    app.use(`${prefix}/upload`, uploadRoutes);
    app.use(`${prefix}/categories`, categoryRoutes);
  };

  registerRoutes('/api');
  registerRoutes('');

  // Central error handler
  app.use(errorHandler);

  return app;
};

export default createApp;
