import { Router, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { authenticate, AuthenticatedRequest, requireBusiness } from '../middlewares/auth';

const router = Router();

// GET /api/customers
router.get('/', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { search, limit = 100 } = req.query;

    const where: any = {
      businessId: req.businessId,
    };

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
        { address: { contains: q } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { totalSpending: 'desc' },
      take: parseInt(limit as string, 10) || 100,
    });

    res.json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    next(error);
  }
});

// POST /api/customers
router.post('/', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { name, phone, email, address, notes } = req.body;

    if (!name || !phone) {
      res.status(400).json({ success: false, message: 'Customer name and phone number are required.' });
      return;
    }

    const existing = await prisma.customer.findFirst({
      where: { businessId: req.businessId, phone: phone.trim() },
    });

    if (existing) {
      res.status(400).json({ success: false, message: `Customer with phone ${phone} already exists.` });
      return;
    }

    const customer = await prisma.customer.create({
      data: {
        businessId: req.businessId!,
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim().toLowerCase() : undefined,
        address: address || undefined,
        notes: notes || undefined,
      },
    });

    res.status(201).json({ success: true, data: customer, message: `Customer ${customer.name} added.` });
  } catch (error) {
    next(error);
  }
});

// GET /api/customers/:id
router.get('/:id', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const customer = await prisma.customer.findFirst({
      where: { id, businessId: req.businessId },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            items: true,
            payments: true,
          },
        },
      },
    });

    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found.' });
      return;
    }

    // Compute frequent products from previous orders
    const productFrequencyMap: Record<string, { productId: string; name: string; count: number; totalQty: number }> = {};

    const orders = (customer as any).orders || [];
    for (const order of orders) {
      for (const item of order.items || []) {
        if (!productFrequencyMap[item.productId]) {
          productFrequencyMap[item.productId] = {
            productId: item.productId,
            name: item.productName,
            count: 0,
            totalQty: 0,
          };
        }
        productFrequencyMap[item.productId].count += 1;
        productFrequencyMap[item.productId].totalQty += item.quantity;
      }
    }

    const frequentProducts = Object.values(productFrequencyMap).sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: {
        ...customer,
        frequentProducts,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
