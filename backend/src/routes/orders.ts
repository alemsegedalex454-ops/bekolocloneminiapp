import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateTelegram } from '../middleware/auth';

const router = Router();
router.use(authenticateTelegram);

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BK-${timestamp}-${random}`;
}

// POST /api/orders - Create order from cart
router.post('/', async (req: Request, res: Response) => {
  try {
    const { shippingAddress, paymentMethod = 'cod' } = req.body;

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.address) {
      res.status(400).json({ error: 'Shipping address is required (name, phone, address)' });
      return;
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user!.id },
      include: { product: true },
    }) as any[];

    if (cartItems.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    // Check stock for all items
    for (const item of cartItems) {
      if (!item.product.isActive) {
        res.status(400).json({ error: `${item.product.name} is no longer available` });
        return;
      }
      if (item.product.stock < item.quantity) {
        res.status(400).json({ error: `Insufficient stock for ${item.product.name}` });
        return;
      }
    }

    // Calculate totals
    const subtotal = cartItems.reduce(
      (sum: number, item: any) => sum + Number(item.product.price) * item.quantity,
      0
    );

    const order = await prisma.$transaction(async (tx: any) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: req.user!.id,
          subtotal,
          shippingCost: 0,
          total: subtotal,
          shippingAddress,
          paymentMethod,
          items: {
            create: cartItems.map((item: any) => ({
              productId: item.product.id,
              productName: item.product.name,
              productImage: Array.isArray(item.product.images)
                ? (item.product.images as string[])[0] || null
                : null,
              price: Number(item.product.price),
              quantity: item.quantity,
              size: item.size,
              color: item.color,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      // Decrease stock
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.product.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId: req.user!.id },
      });

      return newOrder;
    });

    res.status(201).json({
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        total: Number(order.total),
        items: order.items.map((item: any) => ({
          ...item,
          price: Number(item.price),
        })),
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// GET /api/orders - User's order history
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;

    const where: any = { userId: req.user!.id };
    if (status && status !== 'all') {
      where.status = status as string;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      orders: orders.map((order: any) => ({
        ...order,
        subtotal: Number(order.subtotal),
        shippingCost: Number(order.shippingCost),
        total: Number(order.total),
        items: order.items.map((item: any) => ({
          ...item,
          price: Number(item.price),
        })),
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /api/orders/:id - Order details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const order = await prisma.order.findFirst({
      where: { id, userId: req.user!.id },
      include: { items: true },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const orderWithItems = order as any;
    res.json({
      order: {
        ...orderWithItems,
        subtotal: Number(orderWithItems.subtotal),
        shippingCost: Number(orderWithItems.shippingCost),
        total: Number(orderWithItems.total),
        items: orderWithItems.items.map((item: any) => ({
          ...item,
          price: Number(item.price),
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

export default router;
