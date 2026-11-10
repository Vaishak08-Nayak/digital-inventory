import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'kirana-ultra-secure-jwt-secret-key-production-ready-32-chars';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (userId: string, email: string) => {
  return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' as any });
};

const sendTokenResponse = (res: Response, user: any, business?: any) => {
  const token = generateToken(user.id, user.email);

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true' || Boolean(process.env.VERCEL),
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const safeUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    businessId: user.businessId || (user.ownedBusinesses && user.ownedBusinesses[0]?.id),
    businessName: business?.name || (user.ownedBusinesses && user.ownedBusinesses[0]?.name),
    isEmailVerified: user.isEmailVerified,
    ownedBusinesses: user.ownedBusinesses || [],
  };

  return res.status(200).json({
    success: true,
    data: {
      user: safeUser,
      token,
      business,
    },
  });
};

// POST /api/auth/register (Owner + Kirana Store setup)
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, phone, businessName, businessType, location, category, description } = req.body;
    const name = (req.body.name || req.body.ownerName || '').trim();

    if (!email || !password || !name) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email address already registered.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || undefined,
        role: 'OWNER',
        isEmailVerified: true,
      },
    });

    const storeName = businessName || `${name}'s Kirana Store`;
    const storeLocation = location || 'Bangalore, Karnataka, India';

    const business = await prisma.business.create({
      data: {
        ownerId: user.id,
        name: storeName,
        email: email.toLowerCase(),
        phone: phone || '+91 98450 12345',
        location: storeLocation,
        category: category || 'Kirana & General Stores',
        businessType: businessType || 'Retail',
        currency: 'INR',
        lowStockThreshold: 10,
        taxRate: 5.0,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { businessId: business.id },
    });

    // Create default categories for Karnataka Kirana
    const defaultCategories = [
      { name: 'Staples & Grains', nameKn: 'ಧಾನ್ಯಗಳು ಮತ್ತು ಬೇಳೆಕಾಳುಗಳು', description: 'Rice, Dal, Atta, Ragi and whole pulses', icon: '🌾' },
      { name: 'Oils & Dairy', nameKn: 'ಎಣ್ಣೆ ಮತ್ತು ಹೈನುಗಾರಿಕೆ', description: 'Pure Nandini ghee, cooking oils, butter and milk products', icon: '🧈' },
      { name: 'Spices & Masalas', nameKn: 'ಮಸಾಲೆಗಳು', description: 'Authentic Karnataka powders, whole spices, sambar mix', icon: '🌶️' },
      { name: 'Beverages', nameKn: 'ಪಾನೀಯಗಳು', description: 'Filter coffee powders, premium teas and healthy drinks', icon: '☕' },
      { name: 'Personal Care', nameKn: 'ವೈಯಕ್ತಿಕ ಆರೈಕೆ', description: 'Mysore Sandal soaps, dental care and grooming essentials', icon: '🧼' },
    ];

    for (const cat of defaultCategories) {
      await prisma.category.create({
        data: {
          businessId: business.id,
          ...cat,
        },
      });
    }

    const userWithBusinesses = await prisma.user.findUnique({
      where: { id: user.id },
      include: { ownedBusinesses: true },
    });

    sendTokenResponse(res, userWithBusinesses, business);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/register-customer
router.post('/register-customer', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'Email address already registered.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || undefined,
        role: 'CUSTOMER',
        isEmailVerified: true,
      },
    });

    // Also link or register customer record under default first business
    const firstBusiness = await prisma.business.findFirst();
    if (firstBusiness) {
      await prisma.customer.create({
        data: {
          businessId: firstBusiness.id,
          userId: user.id,
          name: user.name,
          phone: phone || '+91 99000 00000',
          email: user.email,
          address: address || undefined,
        },
      });
    }

    sendTokenResponse(res, user);
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { ownedBusinesses: true },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    let business = null;
    if (user.ownedBusinesses && user.ownedBusinesses.length > 0) {
      business = user.ownedBusinesses[0];
    } else if (user.businessId) {
      business = await prisma.business.findUnique({ where: { id: user.businessId } });
    }

    sendTokenResponse(res, user, business);
  } catch (error) {
    next(error);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        ownedBusinesses: true,
        business: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        businessId: user.businessId || user.ownedBusinesses[0]?.id,
        businessName: user.business?.name || user.ownedBusinesses[0]?.name,
        isEmailVerified: user.isEmailVerified,
        ownedBusinesses: user.ownedBusinesses,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('jwt');
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully.' });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      // Don't leak user existence in production
      res.json({ success: true, message: 'If that email exists, reset instructions have been sent.' });
      return;
    }

    const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry: new Date(Date.now() + 3600000),
      },
    });

    res.json({
      success: true,
      message: 'Password reset link generated.',
      resetToken, // for testing / development convenience
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      res.status(400).json({ success: false, message: 'Token and new password are required' });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        id: decoded.id,
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid or already used token.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({ success: true, message: 'Password has been reset successfully. Please log in.' });
  } catch (error) {
    next(error);
  }
});

export default router;
