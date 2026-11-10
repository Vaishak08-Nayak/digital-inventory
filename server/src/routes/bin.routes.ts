import { Router, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { authenticate, AuthenticatedRequest, requireBusiness } from '../middlewares/auth';

const router = Router();

// GET /api/bin (Archived / Decommissioned items)
router.get('/', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const archivedProducts = await prisma.product.findMany({
      where: {
        businessId: req.businessId,
        isArchived: true,
      },
      orderBy: { archivedAt: 'desc' },
    });

    res.json({ success: true, count: archivedProducts.length, data: archivedProducts });
  } catch (error) {
    next(error);
  }
});

// POST /api/bin/:id/move (Move to Bin)
router.post('/:id/move', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const product = await prisma.product.findFirst({
      where: { id, businessId: req.businessId },
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    });

    await prisma.inventoryTransaction.create({
      data: {
        businessId: req.businessId!,
        productId: product.id,
        type: 'ARCHIVED',
        quantityDelta: 0,
        previousQuantity: product.quantity,
        newQuantity: product.quantity,
        notes: `Product moved to bin by ${req.user?.name || 'User'}`,
        performedById: req.user?.id,
      },
    });

    res.json({ success: true, data: updated, message: `Moved "${product.name}" to Bin.` });
  } catch (error) {
    next(error);
  }
});

// POST /api/bin/:id/restore (Restore from Bin)
router.post('/:id/restore', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const product = await prisma.product.findFirst({
      where: { id, businessId: req.businessId, isArchived: true },
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Archived product not found.' });
      return;
    }

    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        isArchived: false,
        archivedAt: null,
      },
    });

    await prisma.inventoryTransaction.create({
      data: {
        businessId: req.businessId!,
        productId: product.id,
        type: 'RESTORED',
        quantityDelta: 0,
        previousQuantity: product.quantity,
        newQuantity: product.quantity,
        notes: `Restored from bin back to active catalog`,
        performedById: req.user?.id,
      },
    });

    res.json({ success: true, data: updated, message: `Restored "${product.name}" to active inventory.` });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/bin/:id (Permanently Delete)
router.delete('/:id', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const product = await prisma.product.findFirst({
      where: { id, businessId: req.businessId },
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    // Delete associated transactions and order items references if any
    await prisma.inventoryTransaction.deleteMany({ where: { productId: product.id } });
    await prisma.orderItem.deleteMany({ where: { productId: product.id } });
    await prisma.product.delete({ where: { id: product.id } });

    res.json({ success: true, message: `Product "${product.name}" permanently deleted.` });
  } catch (error) {
    next(error);
  }
});

export default router;
