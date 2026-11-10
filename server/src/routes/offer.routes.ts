import { Router, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { authenticate, AuthenticatedRequest, requireBusiness } from '../middlewares/auth';

const router = Router();

// GET /api/offers
router.get('/', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const offers = await prisma.offer.findMany({
      where: { businessId: req.businessId },
      orderBy: { createdAt: 'desc' },
    });

    const parsedOffers = offers.map((o) => ({
      ...o,
      eligibleCategories: JSON.parse(o.eligibleCategories || '[]'),
      eligibleProducts: JSON.parse(o.eligibleProducts || '[]'),
    }));

    res.json({ success: true, count: parsedOffers.length, data: parsedOffers });
  } catch (error) {
    next(error);
  }
});

// POST /api/offers
router.post('/', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const {
      title,
      description,
      discountType = 'PERCENTAGE',
      discountValue,
      startDate,
      endDate,
      eligibleCategories = [],
      eligibleProducts = [],
    } = req.body;

    if (!title || discountValue === undefined || !endDate) {
      res.status(400).json({ success: false, message: 'Title, discount value, and end date are required.' });
      return;
    }

    const offer = await prisma.offer.create({
      data: {
        businessId: req.businessId!,
        title,
        description: description || undefined,
        discountType,
        discountValue: parseFloat(discountValue) || 0,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: new Date(endDate),
        eligibleCategories: JSON.stringify(eligibleCategories),
        eligibleProducts: JSON.stringify(eligibleProducts),
        isActive: true,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...offer,
        eligibleCategories,
        eligibleProducts,
      },
      message: `Offer "${offer.title}" created.`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

