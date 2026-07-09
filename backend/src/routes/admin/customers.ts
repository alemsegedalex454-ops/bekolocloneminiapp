import { Router, Request, Response } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

// GET /api/admin/customers
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, parseInt(limit as string));

    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search as string } },
        { lastName: { contains: search as string } },
        { username: { contains: search as string } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          _count: { select: { orders: true } },
          orders: {
            select: { total: true },
            where: { status: { not: 'cancelled' } },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      customers: customers.map((c: any) => ({
        ...c,
        telegramId: c.telegramId.toString(),
        totalSpent: c.orders.reduce((sum: number, o: any) => sum + Number(o.total), 0),
        orders: undefined,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// GET /api/admin/customers/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        orders: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        },
        addresses: true,
      },
    });

    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }

    res.json({
      customer: {
        ...customer,
        telegramId: customer.telegramId.toString(),
        orders: customer.orders.map((o: any) => ({
          ...o,
          subtotal: Number(o.subtotal),
          shippingCost: Number(o.shippingCost),
          total: Number(o.total),
          items: o.items.map((i: any) => ({ ...i, price: Number(i.price) })),
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

export default router;
