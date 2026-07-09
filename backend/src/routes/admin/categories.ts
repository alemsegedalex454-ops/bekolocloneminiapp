import { Router, Request, Response } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /api/admin/categories
router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/admin/categories
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, image, sortOrder } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Category name is required' });
      return;
    }

    const slug = slugify(name);
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      res.status(400).json({ error: 'Category with this name already exists' });
      return;
    }

    const maxOrder = await prisma.category.aggregate({ _max: { sortOrder: true } });

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        image: image || null,
        sortOrder: sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });

    res.status(201).json({ category });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT /api/admin/categories/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, image, sortOrder, isActive } = req.body;

    const data: any = {};
    if (name !== undefined) {
      data.name = name;
      data.slug = slugify(name);
    }
    if (image !== undefined) data.image = image;
    if (sortOrder !== undefined) data.sortOrder = sortOrder;
    if (isActive !== undefined) data.isActive = isActive;

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    res.json({ category });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// PUT /api/admin/categories/reorder
router.put('/reorder/batch', async (req: Request, res: Response) => {
  try {
    const { order } = req.body; // [{id: 1, sortOrder: 0}, ...]

    if (!Array.isArray(order)) {
      res.status(400).json({ error: 'Order array is required' });
      return;
    }

    await prisma.$transaction(
      order.map((item: { id: string; sortOrder: number }) =>
        prisma.category.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    res.json({ message: 'Categories reordered' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder categories' });
  }
});

// DELETE /api/admin/categories/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      res.status(400).json({
        error: `Cannot delete category with ${productCount} products. Move or delete the products first.`,
      });
      return;
    }

    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
