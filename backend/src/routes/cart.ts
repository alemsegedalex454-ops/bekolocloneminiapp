import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateTelegram } from '../middleware/auth';

const router = Router();
router.use(authenticateTelegram);

// GET /api/cart - Get user's cart
router.get('/', async (req: Request, res: Response) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user!.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            comparePrice: true,
            images: true,
            stock: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const items = cartItems
      .filter((item: any) => item.product.isActive)
      .map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        product: {
          ...item.product,
          price: Number(item.product.price),
          comparePrice: item.product.comparePrice
            ? Number(item.product.comparePrice)
            : null,
        },
      }));

    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.product.price * item.quantity,
      0
    );

    res.json({
      items,
      subtotal: Math.round(subtotal * 100) / 100,
      total: Math.round(subtotal * 100) / 100,
      count: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/cart - Add item to cart
router.post('/', async (req: Request, res: Response) => {
  try {
    const { productId, quantity = 1, size, color } = req.body;

    if (!productId) {
      res.status(400).json({ error: 'Product ID is required' });
      return;
    }

    // Check product exists and is active
    const product = await prisma.product.findFirst({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (product.stock < quantity) {
      res.status(400).json({ error: 'Insufficient stock' });
      return;
    }

    // Upsert cart item
    const cartItem = await prisma.cartItem.upsert({
      where: {
        userId_productId_size_color: {
          userId: req.user!.id,
          productId,
          size: size || '',
          color: color || '',
        },
      },
      update: {
        quantity: { increment: quantity },
      },
      create: {
        userId: req.user!.id,
        productId,
        quantity,
        size: size || '',
        color: color || '',
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            images: true,
          },
        },
      },
    });

    const itemWithProduct = cartItem as any;
    res.status(201).json({
      item: {
        ...itemWithProduct,
        product: {
          ...itemWithProduct.product,
          price: Number(itemWithProduct.product.price),
        },
      },
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// PUT /api/cart/:id - Update quantity
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { quantity } = req.body;
    const id = req.params.id as string;

    if (!quantity || quantity < 1) {
      res.status(400).json({ error: 'Valid quantity is required' });
      return;
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: { id, userId: req.user!.id },
      include: { product: true },
    });

    if (!cartItem) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    const itemWithProduct = cartItem as any;
    if (itemWithProduct.product.stock < quantity) {
      res.status(400).json({ error: 'Insufficient stock' });
      return;
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });

    res.json({ item: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// DELETE /api/cart/:id - Remove item
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const cartItem = await prisma.cartItem.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!cartItem) {
      res.status(404).json({ error: 'Cart item not found' });
      return;
    }

    await prisma.cartItem.delete({ where: { id } });
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
});

export default router;
