import { Router, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { authenticate, AuthenticatedRequest, requireBusiness } from '../middlewares/auth';

const router = Router();

const calculateStockStatus = (quantity: number, reorderLevel: number): 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' => {
  if (quantity <= 0) return 'OUT_OF_STOCK';
  if (quantity <= reorderLevel) return 'LOW_STOCK';
  return 'AVAILABLE';
};

// GET /api/products
router.get('/', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { search, category, stockStatus, sortBy = 'createdAt', sortOrder = 'desc', limit = 100 } = req.query;

    const where: any = {
      businessId: req.businessId,
      isArchived: false,
    };

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { nameKn: { contains: q } },
        { barcode: { contains: q } },
        { brand: { contains: q } },
        { categoryName: { contains: q } },
      ];
    }

    if (category && typeof category === 'string' && category.trim() !== '') {
      where.categoryName = category.trim();
    }

    if (stockStatus && typeof stockStatus === 'string' && stockStatus.trim() !== '') {
      where.stockStatus = stockStatus.trim();
    }

    let orderBy: any = {};
    const validSortFields = ['name', 'sellingPrice', 'purchasePrice', 'quantity', 'createdAt', 'updatedAt'];
    const sortField = validSortFields.includes(sortBy as string) ? (sortBy as string) : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 'asc' : 'desc';
    orderBy[sortField] = sortDirection;

    const products = await prisma.product.findMany({
      where,
      orderBy,
      take: parseInt(limit as string, 10) || 100,
    });

    res.json({ success: true, count: products.length, data: products });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/barcode/:barcode
router.get('/barcode/:barcode', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const rawBarcode = req.params.barcode;
    const barcode = Array.isArray(rawBarcode) ? rawBarcode[0] : rawBarcode;

    const product = await prisma.product.findFirst({
      where: {
        businessId: req.businessId,
        barcode: barcode.trim(),
        isArchived: false,
      },
    });

    if (!product) {
      res.status(404).json({ success: false, message: `No product found with barcode: ${barcode}` });
      return;
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id
router.get('/:id', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const product = await prisma.product.findFirst({
      where: {
        id,
        businessId: req.businessId,
      },
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

// POST /api/products
router.post('/', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      nameKn,
      brand,
      barcode,
      categoryName,
      groceryType,
      unitType,
      isLooseItem,
      supplier,
      description,
      imageUrl,
      purchasePrice,
      sellingPrice,
      quantity,
      reorderLevel,
    } = req.body;

    if (!name || sellingPrice === undefined || quantity === undefined) {
      res.status(400).json({ success: false, message: 'Product name, selling price, and quantity are required.' });
      return;
    }

    const qty = parseFloat(quantity) || 0;
    const reorder = parseFloat(reorderLevel) || 10;
    const status = calculateStockStatus(qty, reorder);

    const product = await prisma.product.create({
      data: {
        businessId: req.businessId!,
        name,
        nameKn: nameKn || undefined,
        brand: brand || undefined,
        barcode: barcode || undefined,
        categoryName: categoryName || 'Staples & Grains',
        groceryType: groceryType || undefined,
        unitType: unitType || 'KG',
        isLooseItem: Boolean(isLooseItem),
        supplier: supplier || undefined,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        purchasePrice: parseFloat(purchasePrice) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        quantity: qty,
        reorderLevel: reorder,
        stockStatus: status,
      },
    });

    if (qty > 0) {
      await prisma.inventoryTransaction.create({
        data: {
          businessId: req.businessId!,
          productId: product.id,
          type: 'STOCK_IN',
          quantityDelta: qty,
          previousQuantity: 0,
          newQuantity: qty,
          notes: 'Initial opening stock upon item creation',
          performedById: req.user?.id,
        },
      });
    }

    res.status(201).json({ success: true, data: product, message: `Product "${product.name}" created.` });
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id
router.put('/:id', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const existing = await prisma.product.findFirst({
      where: { id, businessId: req.businessId },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const {
      name,
      nameKn,
      brand,
      barcode,
      categoryName,
      groceryType,
      unitType,
      isLooseItem,
      supplier,
      description,
      imageUrl,
      purchasePrice,
      sellingPrice,
      quantity,
      reorderLevel,
    } = req.body;

    const qty = quantity !== undefined ? parseFloat(quantity) : existing.quantity;
    const reorder = reorderLevel !== undefined ? parseFloat(reorderLevel) : existing.reorderLevel;
    const status = calculateStockStatus(qty, reorder);

    const delta = qty - existing.quantity;
    if (delta !== 0) {
      await prisma.inventoryTransaction.create({
        data: {
          businessId: req.businessId!,
          productId: existing.id,
          type: 'ADJUSTMENT',
          quantityDelta: delta,
          previousQuantity: existing.quantity,
          newQuantity: qty,
          notes: 'Manual inventory adjustment via product edit',
          performedById: req.user?.id,
        },
      });
    }

    const updated = await prisma.product.update({
      where: { id: existing.id },
      data: {
        name: name || undefined,
        nameKn: nameKn !== undefined ? nameKn : undefined,
        brand: brand !== undefined ? brand : undefined,
        barcode: barcode !== undefined ? barcode : undefined,
        categoryName: categoryName || undefined,
        groceryType: groceryType !== undefined ? groceryType : undefined,
        unitType: unitType || undefined,
        isLooseItem: isLooseItem !== undefined ? Boolean(isLooseItem) : undefined,
        supplier: supplier !== undefined ? supplier : undefined,
        description: description !== undefined ? description : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        purchasePrice: purchasePrice !== undefined ? parseFloat(purchasePrice) : undefined,
        sellingPrice: sellingPrice !== undefined ? parseFloat(sellingPrice) : undefined,
        quantity: qty,
        reorderLevel: reorder,
        stockStatus: status,
      },
    });

    res.json({ success: true, data: updated, message: `Product "${updated.name}" updated.` });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id (Move to Bin / Soft delete)
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

    const archived = await prisma.product.update({
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
        notes: `Product moved to Bin by ${req.user?.name || 'User'}`,
        performedById: req.user?.id,
      },
    });

    res.json({ success: true, data: archived, message: `Product "${product.name}" moved to Bin.` });
  } catch (error) {
    next(error);
  }
});

export default router;
