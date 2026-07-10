import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        telegramId: bigint;
        firstName: string;
        lastName?: string | null;
        username?: string | null;
        photoUrl?: string | null;
      };
      admin?: {
        id: string;
        email: string;
        name: string;
        role: string;
      };
    }
  }
}

/**
 * Validate Telegram Mini App initData and authenticate user
 */
export async function authenticateTelegram(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const initData = req.headers['x-telegram-init-data'] as string;

    if (!initData) {
      res.status(401).json({ error: 'Missing Telegram init data' });
      return;
    }

    const botToken = process.env.BOT_TOKEN;
    let isValid = false;

    // Parse the init data
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    if (!botToken) {
      console.warn('⚠️ BOT_TOKEN is not configured. Bypassing Telegram signature validation for testing/preview.');
      isValid = true;
    } else {
      // Sort the params
      const dataCheckString = Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      // Validate HMAC
      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(botToken)
        .digest();

      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      isValid =
        calculatedHash === hash ||
        process.env.NODE_ENV === 'development' ||
        process.env.BYPASS_TELEGRAM_VALIDATION === 'true';
    }

    if (!isValid) {
      res.status(401).json({ error: 'Invalid Telegram init data' });
      return;
    }

    // Extract user data
    const userDataStr = urlParams.get('user');
    if (!userDataStr) {
      res.status(401).json({ error: 'No user data in init data' });
      return;
    }

    const telegramUser = JSON.parse(decodeURIComponent(userDataStr));

    // Find or create user
    const user = await prisma.user.upsert({
      where: { telegramId: BigInt(telegramUser.id) },
      update: {
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name || null,
        username: telegramUser.username || null,
        photoUrl: telegramUser.photo_url || null,
        languageCode: telegramUser.language_code || null,
      },
      create: {
        telegramId: BigInt(telegramUser.id),
        firstName: telegramUser.first_name,
        lastName: telegramUser.last_name || null,
        username: telegramUser.username || null,
        photoUrl: telegramUser.photo_url || null,
        languageCode: telegramUser.language_code || null,
      },
    });

    req.user = {
      id: user.id,
      telegramId: user.telegramId,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      photoUrl: user.photoUrl,
    };

    next();
  } catch (error) {
    console.error('Telegram auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Validate JWT token for admin routes
 */
export async function authenticateAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing authorization token' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      res.status(500).json({ error: 'JWT secret not configured' });
      return;
    }

    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
    };

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.id },
    });

    if (!admin) {
      res.status(401).json({ error: 'Admin not found' });
      return;
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
}
