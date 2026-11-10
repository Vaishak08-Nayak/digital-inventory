import { Router, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { authenticate, AuthenticatedRequest, requireBusiness } from '../middlewares/auth';

const router = Router();

// GET /api/reports/dashboard
router.get('/dashboard', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { timeframe = 'monthly' } = req.query;
    const businessId = req.businessId!;

    // Date range calculations
    const now = new Date();
    let startDate = new Date();

    if (timeframe === 'daily') {
      startDate.setHours(0, 0, 0, 0);
    } else if (timeframe === 'weekly') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeframe === 'monthly') {
      startDate.setMonth(now.getMonth() - 1);
    } else if (timeframe === 'yearly') {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    // Product stock metrics
    const [totalProducts, availableProducts, lowStockProducts, outOfStockProducts] = await Promise.all([
      prisma.product.count({ where: { businessId, isArchived: false } }),
      prisma.product.count({ where: { businessId, isArchived: false, stockStatus: 'AVAILABLE' } }),
      prisma.product.count({ where: { businessId, isArchived: false, stockStatus: 'LOW_STOCK' } }),
      prisma.product.count({ where: { businessId, isArchived: false, stockStatus: 'OUT_OF_STOCK' } }),
    ]);

    // Orders in timeframe vs total
    const [timeframeOrders, allOrdersCount] = await Promise.all([
      prisma.order.findMany({
        where: {
          businessId,
          status: { notIn: ['CANCELLED', 'RETURNED'] },
          createdAt: { gte: startDate },
        },
        include: { items: true, payments: true },
      }),
      prisma.order.count({ where: { businessId } }),
    ]);

    const totalRevenue = timeframeOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = timeframeOrders.length;

    // Out of stock product list
    const outOfStockList = await prisma.product.findMany({
      where: { businessId, isArchived: false, stockStatus: 'OUT_OF_STOCK' },
      take: 10,
    });

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { customer: true, items: true, payments: true },
    });

    // Urgent pending deliveries with deadline countdown
    const pendingOrdersWithDeadlines = await prisma.order.findMany({
      where: {
        businessId,
        status: { in: ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY_FOR_DELIVERY'] },
      },
      orderBy: { deliveryDeadline: 'asc' },
      take: 6,
      include: { customer: true },
    });

    const urgentDeliveries = pendingOrdersWithDeadlines.map((order) => {
      let isOverdue = false;
      let remainingMinutes: number | null = null;

      if (order.deliveryDeadline) {
        const diffMs = new Date(order.deliveryDeadline).getTime() - Date.now();
        remainingMinutes = Math.round(diffMs / 60000);
        isOverdue = diffMs < 0;
      }

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        deliveryDeadline: order.deliveryDeadline,
        isOverdue,
        remainingMinutes,
        customer: order.customer ? { name: order.customer.name, phone: order.customer.phone } : undefined,
        createdAt: order.createdAt,
      };
    });

    // Build Chart Series Data
    const chartPointsMap: Record<string, { label: string; revenue: number; orders: number }> = {};

    if (timeframe === 'daily') {
      for (let h = 8; h <= 22; h += 2) {
        const label = `${h}:00`;
        chartPointsMap[label] = { label, revenue: 0, orders: 0 };
      }
    } else if (timeframe === 'weekly') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = days[d.getDay()];
        chartPointsMap[label] = { label, revenue: 0, orders: 0 };
      }
    } else if (timeframe === 'monthly') {
      for (let w = 1; w <= 4; w++) {
        const label = `Week ${w}`;
        chartPointsMap[label] = { label, revenue: 0, orders: 0 };
      }
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let m = 0; m < 12; m++) {
        const label = months[m];
        chartPointsMap[label] = { label, revenue: 0, orders: 0 };
      }
    }

    // Populate chart from actual timeframe orders
    for (const order of timeframeOrders) {
      const orderDate = new Date(order.createdAt);
      let key = '';

      if (timeframe === 'daily') {
        const hour = Math.floor(orderDate.getHours() / 2) * 2;
        key = `${hour}:00`;
      } else if (timeframe === 'weekly') {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        key = days[orderDate.getDay()];
      } else if (timeframe === 'monthly') {
        const dayOfMonth = orderDate.getDate();
        const week = Math.min(4, Math.ceil(dayOfMonth / 7));
        key = `Week ${week}`;
      } else {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        key = months[orderDate.getMonth()];
      }

      if (!chartPointsMap[key]) {
        chartPointsMap[key] = { label: key, revenue: 0, orders: 0 };
      }
      chartPointsMap[key].revenue += order.totalAmount;
      chartPointsMap[key].orders += 1;
    }

    const salesChart = Object.values(chartPointsMap);

    res.json({
      success: true,
      data: {
        stats: {
          totalRevenue,
          totalOrders,
          totalProducts,
          availableProducts,
          lowStockProducts,
          outOfStockProducts,
          allOrdersCount,
        },
        salesChart,
        urgentDeliveries,
        outOfStockList,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/reports/sales
router.get('/sales', authenticate, requireBusiness, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { timeframe = 'monthly', startDate: startQuery, endDate: endQuery } = req.query;
    const businessId = req.businessId!;

    let startDate = startQuery ? new Date(startQuery as string) : new Date();
    let endDate = endQuery ? new Date(endQuery as string) : new Date();

    if (!startQuery) {
      if (timeframe === 'daily') startDate.setHours(0, 0, 0, 0);
      else if (timeframe === 'weekly') startDate.setDate(endDate.getDate() - 7);
      else if (timeframe === 'monthly') startDate.setMonth(endDate.getMonth() - 1);
      else if (timeframe === 'yearly') startDate.setFullYear(endDate.getFullYear() - 1);
    }

    const orders = await prisma.order.findMany({
      where: {
        businessId,
        status: { notIn: ['CANCELLED', 'RETURNED'] },
        createdAt: { gte: startDate, lte: endDate },
      },
      include: {
        items: { include: { product: true } },
        payments: true,
      },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Calculate profit = sum(subtotal - costPrice * quantity)
    let totalCost = 0;
    const productStatsMap: Record<string, { id: string; name: string; quantity: number; revenue: number }> = {};
    const categoryStatsMap: Record<string, { category: string; total: number; count: number }> = {};
    const paymentStatsMap: Record<string, { method: string; amount: number; count: number }> = {};

    for (const order of orders) {
      for (const item of order.items) {
        totalCost += (item.costPrice || 0) * item.quantity;

        // Top products
        if (!productStatsMap[item.productId]) {
          productStatsMap[item.productId] = {
            id: item.productId,
            name: item.productName,
            quantity: 0,
            revenue: 0,
          };
        }
        productStatsMap[item.productId].quantity += item.quantity;
        productStatsMap[item.productId].revenue += item.subtotal;

        // Category breakdown
        const cat = item.product?.categoryName || 'General Grocery';
        if (!categoryStatsMap[cat]) {
          categoryStatsMap[cat] = { category: cat, total: 0, count: 0 };
        }
        categoryStatsMap[cat].total += item.subtotal;
        categoryStatsMap[cat].count += 1;
      }

      // Payments
      for (const pay of order.payments) {
        const method = pay.method || 'CASH';
        if (!paymentStatsMap[method]) {
          paymentStatsMap[method] = { method, amount: 0, count: 0 };
        }
        paymentStatsMap[method].amount += pay.amount;
        paymentStatsMap[method].count += 1;
      }
    }

    const totalProfit = Math.max(0, totalRevenue - totalCost);
    const topProducts = Object.values(productStatsMap).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
    const categoryBreakdown = Object.values(categoryStatsMap).sort((a, b) => b.total - a.total);
    const paymentBreakdown = Object.values(paymentStatsMap).sort((a, b) => b.amount - a.amount);

    // Sales trend
    const salesTrendMap: Record<string, { label: string; revenue: number; orders: number }> = {};
    for (const order of orders) {
      const d = new Date(order.createdAt).toISOString().split('T')[0];
      if (!salesTrendMap[d]) {
        salesTrendMap[d] = { label: d, revenue: 0, orders: 0 };
      }
      salesTrendMap[d].revenue += order.totalAmount;
      salesTrendMap[d].orders += 1;
    }
    const salesTrend = Object.values(salesTrendMap).sort((a, b) => a.label.localeCompare(b.label));

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        totalProfit,
        salesTrend,
        topProducts,
        categoryBreakdown,
        paymentBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

