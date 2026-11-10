import { Router, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { authenticate, AuthenticatedRequest, requireBusiness } from '../middlewares/auth';

const router = Router();

const calculateStockStatus = (quantity: number, reorderLevel: number): 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK' => {
  if (quantity <= 0) return 'OUT_OF_STOCK';
  if (quantity <= reorderLevel) return 'LOW_STOCK';
  return 'AVAILABLE';
};

// GET /api/orders
router.get('/', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { status, search, limit = 100 } = req.query;

    const where: any = {
      businessId: req.businessId,
    };

    if (status && typeof status === 'string' && status.trim() !== '') {
      where.status = status.trim();
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim();
      where.OR = [
        { orderNumber: { contains: q } },
        { customer: { name: { contains: q } } },
        { customer: { phone: { contains: q } } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string, 10) || 100,
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
        payments: true,
      },
    });

    const now = new Date().getTime();
    const formattedOrders = orders.map((order) => {
      let isOverdue = false;
      let remainingMinutes: number | null = null;

      if (order.deliveryDeadline && order.status !== 'DELIVERED' && order.status !== 'CANCELLED') {
        const deadlineTime = new Date(order.deliveryDeadline).getTime();
        const diffMs = deadlineTime - now;
        remainingMinutes = Math.round(diffMs / 60000);
        isOverdue = diffMs < 0;
      }

      return {
        ...order,
        isOverdue,
        remainingMinutes,
      };
    });

    res.json({ success: true, count: formattedOrders.length, data: formattedOrders });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:id
router.get('/:id', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const order = await prisma.order.findFirst({
      where: {
        id,
        businessId: req.businessId,
      },
      include: {
        customer: true,
        items: {
          include: { product: true },
        },
        payments: true,
      },
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
});

// POST /api/orders (POS Checkout & Order Processing)
router.post('/', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const {
      customerId,
      customerName = 'Walk-in Customer',
      customerPhone,
      customerAddress,
      items,
      discountAmount = 0,
      paymentMethod = 'CASH',
      deliveryDeadline,
      deliveryAddress,
      notes,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
      return;
    }

    const business = await prisma.business.findUnique({
      where: { id: req.businessId },
    });

    if (!business) {
      res.status(404).json({ success: false, message: 'Business not found.' });
      return;
    }

    // Resolve or create Customer
    let resolvedCustomerId = customerId;
    if (!resolvedCustomerId && customerPhone) {
      let cust = await prisma.customer.findFirst({
        where: { businessId: req.businessId, phone: customerPhone },
      });

      if (!cust) {
        cust = await prisma.customer.create({
          data: {
            businessId: req.businessId!,
            name: customerName,
            phone: customerPhone,
            address: customerAddress || deliveryAddress || undefined,
          },
        });
      }
      resolvedCustomerId = cust.id;
    }

    // Compute subtotal and prepare items
    let subtotal = 0;
    const preparedItems: {
      productId: string;
      productName: string;
      unitPrice: number;
      costPrice: number;
      quantity: number;
      subtotal: number;
    }[] = [];

    for (const item of items) {
      const prod = await prisma.product.findFirst({
        where: { id: item.productId, businessId: req.businessId },
      });

      if (!prod) {
        res.status(400).json({ success: false, message: `Product not found: ${item.productId}` });
        return;
      }

      const itemQty = parseFloat(item.quantity) || 1;
      const unitPrice = parseFloat(item.unitPrice) || prod.sellingPrice;
      const itemSubtotal = unitPrice * itemQty;

      subtotal += itemSubtotal;
      preparedItems.push({
        productId: prod.id,
        productName: prod.name,
        unitPrice,
        costPrice: prod.purchasePrice,
        quantity: itemQty,
        subtotal: itemSubtotal,
      });
    }

    const discount = Math.min(subtotal, Math.max(0, parseFloat(discountAmount) || 0));
    const taxableAmount = subtotal - discount;
    const taxRate = business.taxRate || 5.0;
    const taxAmount = (taxableAmount * taxRate) / 100;
    const totalAmount = Math.round((taxableAmount + taxAmount) * 100) / 100;

    // Generate unique order number
    const count = await prisma.order.count({ where: { businessId: req.businessId } });
    const orderNumber = `ORD-${String(count + 1001).padStart(5, '0')}`;

    // Create Order with Items and Payment
    const createdOrder = await prisma.order.create({
      data: {
        businessId: req.businessId!,
        customerId: resolvedCustomerId || undefined,
        userId: req.user?.id,
        orderNumber,
        subtotal,
        discountAmount: discount,
        taxAmount,
        totalAmount,
        status: 'CONFIRMED',
        deliveryDeadline: deliveryDeadline ? new Date(deliveryDeadline) : undefined,
        deliveryAddress: deliveryAddress || customerAddress || undefined,
        notes: notes || undefined,
        items: {
          create: preparedItems,
        },
        payments: {
          create: {
            amount: totalAmount,
            method: paymentMethod,
            status: 'COMPLETED',
          },
        },
      },
      include: {
        customer: true,
        items: { include: { product: true } },
        payments: true,
      },
    });

    // Deduct stock and log SALE transactions
    for (const item of preparedItems) {
      const currentProduct = await prisma.product.findUnique({ where: { id: item.productId } });
      if (currentProduct) {
        const newQty = Math.max(0, currentProduct.quantity - item.quantity);
        const newStatus = calculateStockStatus(newQty, currentProduct.reorderLevel);

        await prisma.product.update({
          where: { id: currentProduct.id },
          data: {
            quantity: newQty,
            stockStatus: newStatus,
          },
        });

        await prisma.inventoryTransaction.create({
          data: {
            businessId: req.businessId!,
            productId: currentProduct.id,
            type: 'SALE',
            quantityDelta: -item.quantity,
            previousQuantity: currentProduct.quantity,
            newQuantity: newQty,
            referenceId: createdOrder.id,
            notes: `POS Sale Order #${orderNumber}`,
            performedById: req.user?.id,
          },
        });

        // Trigger notification if low stock / out of stock
        if (newStatus === 'OUT_OF_STOCK') {
          await prisma.notification.create({
            data: {
              businessId: req.businessId!,
              type: 'OUT_OF_STOCK',
              title: `Stock Depleted: ${currentProduct.name}`,
              message: `${currentProduct.name} is now out of stock following order #${orderNumber}. Please reorder immediately.`,
              metadata: JSON.stringify({ productId: currentProduct.id, orderId: createdOrder.id }),
            },
          });
        } else if (newStatus === 'LOW_STOCK') {
          await prisma.notification.create({
            data: {
              businessId: req.businessId!,
              type: 'LOW_STOCK',
              title: `Low Stock Warning: ${currentProduct.name}`,
              message: `${currentProduct.name} has only ${newQty} ${currentProduct.unitType} remaining (below threshold of ${currentProduct.reorderLevel}).`,
              metadata: JSON.stringify({ productId: currentProduct.id, orderId: createdOrder.id }),
            },
          });
        }
      }
    }

    // Update customer spending stats if linked
    if (resolvedCustomerId) {
      await prisma.customer.update({
        where: { id: resolvedCustomerId },
        data: {
          totalOrders: { increment: 1 },
          totalSpending: { increment: totalAmount },
          lastPurchaseDate: new Date(),
        },
      });
    }

    res.status(201).json({
      success: true,
      data: createdOrder,
      message: `Sale Order #${orderNumber} processed successfully.`,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/orders/:id/status
router.put('/:id/status', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status } = req.body;

    const validStatuses = [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'READY_FOR_DELIVERY',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
      'RETURNED',
    ];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const order = await prisma.order.findFirst({
      where: { id, businessId: req.businessId },
      include: { items: true },
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    // If order is cancelled or returned, optionally restore inventory if not already returned
    if ((status === 'CANCELLED' || status === 'RETURNED') && order.status !== 'CANCELLED' && order.status !== 'RETURNED') {
      const orderItems = (order as any).items || [];
      for (const item of orderItems) {
        const prod = await prisma.product.findUnique({ where: { id: item.productId } });
        if (prod) {
          const restoredQty = prod.quantity + item.quantity;
          const restoredStatus = calculateStockStatus(restoredQty, prod.reorderLevel);

          await prisma.product.update({
            where: { id: prod.id },
            data: { quantity: restoredQty, stockStatus: restoredStatus },
          });

          await prisma.inventoryTransaction.create({
            data: {
              businessId: req.businessId!,
              productId: prod.id,
              type: status === 'CANCELLED' ? 'ADJUSTMENT' : 'RETURN',
              quantityDelta: item.quantity,
              previousQuantity: prod.quantity,
              newQuantity: restoredQty,
              referenceId: order.id,
              notes: `Order #${order.orderNumber} ${status.toLowerCase()} - inventory restored`,
              performedById: req.user?.id,
            },
          });
        }
      }
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status },
      include: {
        customer: true,
        items: { include: { product: true } },
        payments: true,
      },
    });

    res.json({ success: true, data: updated, message: `Order #${order.orderNumber} status updated to ${status}.` });
  } catch (error) {
    next(error);
  }
});

export default router;
