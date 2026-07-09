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

// GET /api/admin/products - List all products (with inactive)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, category, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(50, parseInt(limit as string));

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } },
      ];
    }
    if (category) {
      where.categoryId = category as string;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products: products.map((p: any) => ({
        ...p,
        price: Number(p.price),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// POST /api/admin/products - Create product
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name, description, price, comparePrice, images,
      sizes, colors, stock, isFeatured, isActive, categoryId,
    } = req.body;

    if (!name || !price || !categoryId) {
      res.status(400).json({ error: 'Name, price, and category are required' });
      return;
    }

    let slug = slugify(name);
    // Ensure unique slug
    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        images: images || [],
        sizes: sizes || [],
        colors: colors || [],
        stock: stock || 0,
        isFeatured: isFeatured || false,
        isActive: isActive !== undefined ? isActive : true,
        categoryId: categoryId as string,
      },
      include: { category: { select: { id: true, name: true } } },
    });

    res.status(201).json({
      product: {
        ...product,
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      },
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PUT /api/admin/products/:id - Update product
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const {
      name, description, price, comparePrice, images,
      sizes, colors, stock, isFeatured, isActive, categoryId,
    } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const data: any = {};
    if (name !== undefined) {
      data.name = name;
      if (name !== existing.name) {
        let slug = slugify(name);
        const existingSlug = await prisma.product.findFirst({
          where: { slug, id: { not: id } },
        });
        if (existingSlug) slug = `${slug}-${Date.now().toString(36)}`;
        data.slug = slug;
      }
    }
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = parseFloat(price);
    if (comparePrice !== undefined) data.comparePrice = comparePrice ? parseFloat(comparePrice) : null;
    if (images !== undefined) data.images = images;
    if (sizes !== undefined) data.sizes = sizes;
    if (colors !== undefined) data.colors = colors;
    if (stock !== undefined) data.stock = stock;
    if (isFeatured !== undefined) data.isFeatured = isFeatured;
    if (isActive !== undefined) data.isActive = isActive;
    if (categoryId !== undefined) data.categoryId = categoryId as string;

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { category: { select: { id: true, name: true } } },
    });

    res.json({
      product: {
        ...product,
        price: Number(product.price),
        comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/admin/products/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;
