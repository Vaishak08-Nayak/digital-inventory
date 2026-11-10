import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import createApp from './app';
import { prisma } from './prisma/client';
import { seedDatabase } from './prisma/seed';

const DEFAULT_PORT = parseInt(process.env.PORT as string, 10) || 5001;

async function bootstrap() {
  try {
    console.log('🔄 Checking database connection and initialization...');
    await prisma.$connect();
    console.log('✅ Database connected.');

    // Auto-seed if database is fresh
    try {
      await seedDatabase();
    } catch (seedErr) {
      console.warn('⚠️ Note on database seed:', seedErr);
    }

    const app = createApp();

    const startServer = (port: number) => {
      const server = app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 Digital Kirana API Server running on port ${port}`);
        console.log(`📡 URL: http://localhost:${port}`);
        console.log(`⚡ Health check: http://localhost:${port}/api/health`);
      });

      server.on('error', (err: any) => {
        if ((err.code === 'EADDRINUSE' || err.code === 'EACCES') && port < DEFAULT_PORT + 10) {
          console.warn(`⚠️ Port ${port} unavailable (${err.code}). Attempting port ${port + 1}...`);
          startServer(port + 1);
        } else {
          console.error('❌ Server startup error:', err);
          process.exit(1);
        }
      });

      const shutdown = async () => {
        console.log('Stopping server...');
        server.close(async () => {
          await prisma.$disconnect();
          console.log('Server and database shut down safely.');
          process.exit(0);
        });
      };

      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
    };

    startServer(DEFAULT_PORT);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();

