import { Router, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma/client';
import { authenticate, AuthenticatedRequest, requireBusiness } from '../middlewares/auth';

const router = Router();

// GET /api/business
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let business = null;
    if (req.businessId) {
      business = await prisma.business.findUnique({
        where: { id: req.businessId },
        include: {
          members: {
            select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
          },
        },
      });
    }

    if (!business) {
      business = await prisma.business.findFirst({
        include: {
          members: {
            select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
          },
        },
      });
    }

    if (!business) {
      res.status(404).json({ success: false, message: 'Business profile not found.' });
      return;
    }

    res.json({ success: true, data: business });
  } catch (error) {
    next(error);
  }
});

// PUT /api/business
router.put('/', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      email,
      phone,
      location,
      category,
      businessType,
      logoUrl,
      description,
      currency,
      lowStockThreshold,
      taxRate,
    } = req.body;

    const updated = await prisma.business.update({
      where: { id: req.businessId },
      data: {
        name: name || undefined,
        email: email || undefined,
        phone: phone || undefined,
        location: location || undefined,
        category: category || undefined,
        businessType: businessType || undefined,
        logoUrl: logoUrl !== undefined ? logoUrl : undefined,
        description: description !== undefined ? description : undefined,
        currency: currency || undefined,
        lowStockThreshold: lowStockThreshold !== undefined ? parseFloat(lowStockThreshold) : undefined,
        taxRate: taxRate !== undefined ? parseFloat(taxRate) : undefined,
      },
    });

    res.json({ success: true, data: updated, message: 'Business settings updated.' });
  } catch (error) {
    next(error);
  }
});

// POST /api/business/staff
router.post('/staff', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Name, email, and password are required for staff members.' });
      return;
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'A user with this email already exists.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStaff = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone || undefined,
        role: role === 'OWNER' ? 'OWNER' : 'STAFF',
        businessId: req.businessId,
        isEmailVerified: true,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: newStaff.id,
        name: newStaff.name,
        email: newStaff.email,
        phone: newStaff.phone,
        role: newStaff.role,
      },
      message: `Staff member ${newStaff.name} created successfully.`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

