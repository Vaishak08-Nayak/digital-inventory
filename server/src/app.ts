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
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Allow all in dev mode for smooth onboarding
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Static uploads directory
  const uploadsPath = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsPath));

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Digital Kirana API Engine',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/business', businessRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/offers', offerRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/bin', binRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/categories', categoryRoutes);

  // Fallback 404
  app.use((req: Request, res: Response) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.url}` });
  });

  // Central error handler
  app.use(errorHandler);

  return app;
};

export default createApp;

