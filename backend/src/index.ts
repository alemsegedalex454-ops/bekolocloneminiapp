import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import { authenticateAdmin } from './middleware/auth';

// Route imports
import productsRouter from './routes/products';
import categoriesRouter from './routes/categories';
import cartRouter from './routes/cart';
import ordersRouter from './routes/orders';
import usersRouter from './routes/users';

// Admin route imports
import adminAuthRouter from './routes/admin/auth';
import adminDashboardRouter from './routes/admin/dashboard';
import adminProductsRouter from './routes/admin/products';
import adminCategoriesRouter from './routes/admin/categories';
import adminOrdersRouter from './routes/admin/orders';
import adminCustomersRouter from './routes/admin/customers';
import adminMediaRouter from './routes/admin/media';
import adminSettingsRouter from './routes/admin/settings';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);

// Authenticated customer routes (Telegram auth applied inside routers)
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/users', usersRouter);

// Admin routes
app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/admin/dashboard', authenticateAdmin, adminDashboardRouter);
app.use('/api/admin/products', authenticateAdmin, adminProductsRouter);
app.use('/api/admin/categories', authenticateAdmin, adminCategoriesRouter);
app.use('/api/admin/orders', authenticateAdmin, adminOrdersRouter);
app.use('/api/admin/customers', authenticateAdmin, adminCustomersRouter);
app.use('/api/admin/media', authenticateAdmin, adminMediaRouter);
app.use('/api/admin/settings', authenticateAdmin, adminSettingsRouter);

// Store settings (public read)
app.get('/api/settings', async (_req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const settings = await prisma.storeSetting.findMany();
    const settingsMap: Record<string, any> = {};
    settings.forEach((s: any) => {
      try { settingsMap[s.key] = JSON.parse(s.value); }
      catch { settingsMap[s.key] = s.value; }
    });
    res.json({ settings: settingsMap });
  } catch {
    res.json({ settings: {} });
  }
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 API: http://localhost:${PORT}/api`);
});

export default app;
