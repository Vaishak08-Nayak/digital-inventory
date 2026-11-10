import { Router, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { authenticate, AuthenticatedRequest, requireBusiness } from '../middlewares/auth';

const router = Router();

// GET /api/notifications
router.get('/', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { unread } = req.query;

    const where: any = {
      businessId: req.businessId,
    };

    if (unread === 'true') {
      where.isRead = false;
    }

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.notification.count({
        where: { businessId: req.businessId, isRead: false },
      }),
    ]);

    const formatted = notifications.map((n) => ({
      ...n,
      metadata: n.metadata ? JSON.parse(n.metadata) : undefined,
    }));

    res.json({
      success: true,
      unreadCount,
      count: formatted.length,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/notifications/recommendations
router.get('/recommendations', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // Generate dynamic restocking & seasonal Kirana inventory recommendations
    const criticalProducts = await prisma.product.findMany({
      where: {
        businessId: req.businessId,
        isArchived: false,
        stockStatus: { in: ['LOW_STOCK', 'OUT_OF_STOCK'] },
      },
      take: 6,
    });

    const recommendations = criticalProducts.map((p) => {
      const suggestedReorder = Math.max(20, Math.ceil(p.reorderLevel * 2.5));
      return {
        id: `rec-${p.id}`,
        productId: p.id,
        productName: p.name,
        nameKn: p.nameKn,
        currentStock: p.quantity,
        reorderLevel: p.reorderLevel,
        unitType: p.unitType,
        suggestedReorder,
        estimatedCost: suggestedReorder * p.purchasePrice,
        urgency: p.quantity <= 0 ? 'HIGH' : 'MEDIUM',
        message:
          p.quantity <= 0
            ? `Critical: ${p.name} is completely out of stock. Immediate replenishment of at least ${suggestedReorder} ${p.unitType} recommended.`
            : `Replenishment recommended: Current stock of ${p.name} (${p.quantity} ${p.unitType}) is below minimum buffer of ${p.reorderLevel} ${p.unitType}.`,
      };
    });

    res.json({ success: true, count: recommendations.length, data: recommendations });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await prisma.notification.updateMany({
      where: { id, businessId: req.businessId },
      data: { isRead: true },
    });

    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    next(error);
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.notification.updateMany({
      where: { businessId: req.businessId, isRead: false },
      data: { isRead: true },
    });

    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
});

export default router;
