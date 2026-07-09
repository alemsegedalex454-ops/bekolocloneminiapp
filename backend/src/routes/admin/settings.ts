import { Router, Request, Response } from 'express';
import prisma from '../../lib/prisma';

const router = Router();

// GET /api/admin/settings
router.get('/', async (_req: Request, res: Response) => {
  try {
    const settings = await prisma.storeSetting.findMany();

    const settingsMap: Record<string, any> = {};
    settings.forEach((s: any) => {
      try {
        settingsMap[s.key] = JSON.parse(s.value);
      } catch {
        settingsMap[s.key] = s.value;
      }
    });

    res.json({ settings: settingsMap });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/admin/settings
router.put('/', async (req: Request, res: Response) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      res.status(400).json({ error: 'Settings object is required' });
      return;
    }

    const updates = Object.entries(settings).map(([key, value]) =>
      prisma.storeSetting.upsert({
        where: { key },
        update: { value: typeof value === 'string' ? value : JSON.stringify(value) },
        create: { key, value: typeof value === 'string' ? value : JSON.stringify(value) },
      })
    );

    await prisma.$transaction(updates);

    res.json({ message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
