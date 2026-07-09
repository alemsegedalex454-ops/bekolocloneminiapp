import { Router, Request, Response } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

// GET /api/admin/dashboard - Dashboard stats
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      revenueResult,
      recentOrders,
      lowStockProducts,
      ordersByStatus,
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.user.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'cancelled' } },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { firstName: true, lastName: true, username: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.product.findMany({
        where: { stock: { lte: 5 }, isActive: true },
        select: { id: true, name: true, stock: true, images: true },
        orderBy: { stock: 'asc' },
        take: 10,
      }),
      prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    res.json({
      stats: {
        totalProducts,
        totalOrders,
        totalCustomers,
        revenue: revenueResult._sum.total ? Number(revenueResult._sum.total) : 0,
      },
      recentOrders: recentOrders.map((order: any) => ({
        ...order,
        subtotal: Number(order.subtotal),
        total: Number(order.total),
        shippingCost: Number(order.shippingCost),
      })),
      lowStockProducts,
      ordersByStatus: ordersByStatus.reduce(
        (acc: any, item: any) => ({ ...acc, [item.status]: item._count.status }),
        {} as Record<string, number>
      ),
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
