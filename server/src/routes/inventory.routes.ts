import { Router, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { authenticate, AuthenticatedRequest, requireBusiness } from '../middlewares/auth';

const router = Router();

const calculateStockStatus = (quantity: number, reorderLevel: number): 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' => {
  if (quantity <= 0) return 'OUT_OF_STOCK';
  if (quantity <= reorderLevel) return 'LOW_STOCK';
  return 'AVAILABLE';
};

// GET /api/inventory/transactions
router.get('/transactions', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = 100, productId, type } = req.query;

    const where: any = {
      businessId: req.businessId,
    };

    if (productId && typeof productId === 'string') {
      where.productId = productId;
    }

    if (type && typeof type === 'string') {
      where.type = type;
    }

    const transactions = await prisma.inventoryTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string, 10) || 100,
      include: {
        product: {
          select: { id: true, name: true, nameKn: true, unitType: true, barcode: true },
        },
        performedBy: {
          select: { name: true, email: true },
        },
      },
    });

    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    next(error);
  }
});

// POST /api/inventory/stock-in
router.post('/stock-in', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { productId, quantity, costPrice, notes } = req.body;

    if (!productId || quantity === undefined) {
      res.status(400).json({ success: false, message: 'Product ID and quantity are required.' });
      return;
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      res.status(400).json({ success: false, message: 'Stock-in quantity must be greater than zero.' });
      return;
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, businessId: req.businessId },
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const newQuantity = product.quantity + qty;
    const stockStatus = calculateStockStatus(newQuantity, product.reorderLevel);

    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: {
        quantity: newQuantity,
        stockStatus,
        purchasePrice: costPrice !== undefined && costPrice !== null && !isNaN(parseFloat(costPrice))
          ? parseFloat(costPrice)
          : product.purchasePrice,
      },
    });

    const transaction = await prisma.inventoryTransaction.create({
      data: {
        businessId: req.businessId!,
        productId: product.id,
        type: 'STOCK_IN',
        quantityDelta: qty,
        previousQuantity: product.quantity,
        newQuantity,
        notes: notes || `Stock replenished: +${qty} ${product.unitType}`,
        performedById: req.user?.id,
      },
    });

    res.json({
      success: true,
      data: { product: updatedProduct, transaction },
      message: `Successfully replenished ${qty} ${product.unitType} of ${product.name}`,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/inventory/adjust
router.post('/adjust', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { productId, delta, reason } = req.body;

    if (!productId || delta === undefined) {
      res.status(400).json({ success: false, message: 'Product ID and delta are required.' });
      return;
    }

    const change = parseFloat(delta);
    if (isNaN(change) || change === 0) {
      res.status(400).json({ success: false, message: 'Delta must be a non-zero number.' });
      return;
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, businessId: req.businessId },
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const newQuantity = Math.max(0, product.quantity + change);
    const actualDelta = newQuantity - product.quantity;
    const stockStatus = calculateStockStatus(newQuantity, product.reorderLevel);

    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: {
        quantity: newQuantity,
        stockStatus,
      },
    });

    const transaction = await prisma.inventoryTransaction.create({
      data: {
        businessId: req.businessId!,
        productId: product.id,
        type: 'ADJUSTMENT',
        quantityDelta: actualDelta,
        previousQuantity: product.quantity,
        newQuantity,
        notes: reason || 'Manual stock adjustment',
        performedById: req.user?.id,
      },
    });

    res.json({
      success: true,
      data: { product: updatedProduct, transaction },
      message: `Adjusted ${product.name} by ${actualDelta > 0 ? '+' : ''}${actualDelta} ${product.unitType}`,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

