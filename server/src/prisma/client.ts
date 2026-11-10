import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

// On Vercel serverless functions, filesystem is read-only except /tmp
let datasourceUrl = process.env.DATABASE_URL;

if (process.env.VERCEL && (!datasourceUrl || datasourceUrl.startsWith('file:'))) {
  const tmpDbPath = path.join('/tmp', 'dev.db');
  if (!fs.existsSync(tmpDbPath)) {
    const candidatePaths = [
      path.join(process.cwd(), 'server', 'prisma', 'dev.db'),
      path.join(process.cwd(), 'prisma', 'dev.db'),
      path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
      path.join(__dirname, '..', '..', '..', 'server', 'prisma', 'dev.db'),
    ];
    for (const src of candidatePaths) {
      if (fs.existsSync(src)) {
        try {
          fs.copyFileSync(src, tmpDbPath);
          break;
        } catch (e) {
          console.warn('Could not copy dev.db to /tmp:', e);
        }
      }
    }
  }
  datasourceUrl = `file:${tmpDbPath}`;
}

export const prisma = new PrismaClient(
  datasourceUrl ? { datasources: { db: { url: datasourceUrl } } } : undefined
);

export default prisma;
