import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { authenticateTelegram } from '../middleware/auth';

const router = Router();
router.use(authenticateTelegram);

// GET /api/users/me - Get current user
router.get('/me', async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        _count: {
          select: {
            orders: true,
            wishlist: true,
            addresses: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        ...user,
        telegramId: user.telegramId.toString(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ============================================================
// WISHLIST
// ============================================================

// GET /api/users/wishlist
router.get('/wishlist', async (req: Request, res: Response) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user!.id },
      include: {
        product: {
          include: { category: { select: { name: true, slug: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      wishlist: wishlist.map((w: any) => ({
        id: w.id,
        productId: w.productId,
        createdAt: w.createdAt,
        product: {
          ...w.product,
          price: Number(w.product.price),
          comparePrice: w.product.comparePrice ? Number(w.product.comparePrice) : null,
        },
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// POST /api/users/wishlist
router.post('/wishlist', async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;

    const existing = await prisma.wishlist.findUnique({
      where: { userId_productId: { userId: req.user!.id, productId } },
    });

    if (existing) {
      // Toggle - remove if exists
      await prisma.wishlist.delete({ where: { id: existing.id } });
      res.json({ wishlisted: false });
      return;
    }

    await prisma.wishlist.create({
      data: { userId: req.user!.id, productId },
    });

    res.json({ wishlisted: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update wishlist' });
  }
});

// GET /api/users/wishlist/ids - Get wishlisted product IDs
router.get('/wishlist/ids', async (req: Request, res: Response) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user!.id },
      select: { productId: true },
    });
    res.json({ productIds: wishlist.map((w: any) => w.productId) });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wishlist IDs' });
  }
});

// ============================================================
// RECENTLY VIEWED
// ============================================================

// POST /api/users/recently-viewed
router.post('/recently-viewed', async (req: Request, res: Response) => {
  try {
    const { productId } = req.body;

    await prisma.recentlyViewed.upsert({
      where: { userId_productId: { userId: req.user!.id, productId } },
      update: { viewedAt: new Date() },
      create: { userId: req.user!.id, productId },
    });

    // Keep only the last 20
    const items = await prisma.recentlyViewed.findMany({
      where: { userId: req.user!.id },
      orderBy: { viewedAt: 'desc' },
      skip: 20,
    });

    if (items.length > 0) {
      await prisma.recentlyViewed.deleteMany({
        where: { id: { in: items.map((i: any) => i.id) } },
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to track view' });
  }
});

// GET /api/users/recently-viewed
router.get('/recently-viewed', async (req: Request, res: Response) => {
  try {
    const items = await prisma.recentlyViewed.findMany({
      where: { userId: req.user!.id },
      include: { product: true },
      orderBy: { viewedAt: 'desc' },
      take: 20,
    });

    res.json({
      products: items.map((item: any) => ({
        ...item.product,
        price: Number(item.product.price),
        comparePrice: item.product.comparePrice ? Number(item.product.comparePrice) : null,
        viewedAt: item.viewedAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recently viewed' });
  }
});

// ============================================================
// ADDRESSES
// ============================================================

// GET /api/users/addresses
router.get('/addresses', async (req: Request, res: Response) => {
  try {
    const addresses = await prisma.address.findMany({
      where: { userId: req.user!.id },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    res.json({ addresses });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// POST /api/users/addresses
router.post('/addresses', async (req: Request, res: Response) => {
  try {
    const { label, name, phone, address, city, isDefault } = req.body;

    if (!name || !phone || !address || !city) {
      res.status(400).json({ error: 'Name, phone, address, and city are required' });
      return;
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: req.user!.id,
        label,
        name,
        phone,
        address,
        city,
        isDefault: isDefault || false,
      },
    });

    res.status(201).json({ address: newAddress });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create address' });
  }
});

// PUT /api/users/addresses/:id
router.put('/addresses/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { label, name, phone, address, city, isDefault } = req.body;

    const existing = await prisma.address.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user!.id, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: { label, name, phone, address, city, isDefault },
    });

    res.json({ address: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update address' });
  }
});

// DELETE /api/users/addresses/:id
router.delete('/addresses/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.address.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      res.status(404).json({ error: 'Address not found' });
      return;
    }

    await prisma.address.delete({ where: { id } });
    res.json({ message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

export default router;
