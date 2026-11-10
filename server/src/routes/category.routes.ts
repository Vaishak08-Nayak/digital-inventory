import { Router, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { authenticate, AuthenticatedRequest, requireBusiness } from '../middlewares/auth';

const router = Router();

// GET /api/categories
router.get('/', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.category.findMany({
      where: { businessId: req.businessId },
      orderBy: { name: 'asc' },
    });

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const itemsCount = await prisma.product.count({
          where: {
            businessId: req.businessId,
            categoryName: cat.name,
            isArchived: false,
          },
        });
        return {
          ...cat,
          itemsCount,
        };
      })
    );

    res.json({ success: true, count: categoriesWithCount.length, data: categoriesWithCount });
  } catch (error) {
    next(error);
  }
});

// POST /api/categories
router.post('/', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, nameKn, description, icon } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'Category name is required.' });
      return;
    }

    const category = await prisma.category.create({
      data: {
        businessId: req.businessId!,
        name: name.trim(),
        nameKn: nameKn ? nameKn.trim() : undefined,
        description: description || undefined,
        icon: icon || '📦',
      },
    });

    res.status(201).json({ success: true, data: category, message: `Category "${category.name}" created.` });
  } catch (error) {
    next(error);
  }
});

export default router;

