import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'STAFF' | 'CUSTOMER';
  businessId?: string;
  isEmailVerified: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  businessId?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'kirana-ultra-secure-jwt-secret-key-production-ready-32-chars';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.cookies?.jwt || req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        ownedBusinesses: { take: 1 },
      },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'User account no longer exists.' });
      return;
    }

    const businessId = user.businessId || user.ownedBusinesses[0]?.id;

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      businessId,
      isEmailVerified: user.isEmailVerified,
    };
    req.businessId = businessId;

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
  }
};

export const requireBusiness = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.businessId) {
    res.status(403).json({ success: false, message: 'No registered Kirana business associated with this account.' });
    return;
  }
  next();
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Access denied: insufficient permissions.' });
      return;
    }
    next();
  };
};

