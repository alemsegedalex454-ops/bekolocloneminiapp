import { Telegraf, Markup } from 'telegraf';

import prisma from '../lib/prisma';

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://your-domain.com';

if (!BOT_TOKEN) {
  console.warn('⚠️  BOT_TOKEN not set. Telegram bot will not start.');
  process.exit(0);
}

const bot = new Telegraf(BOT_TOKEN);

// Action handlers for order receipts approval/rejection
bot.action(/^approve_order:(.+)$/, async (ctx) => {
  const orderId = ctx.match[1];
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      await ctx.answerCbQuery('Order not found ❌');
      return;
    }

    if (order.status !== 'pending') {
      await ctx.answerCbQuery(`Order is already ${order.status} ℹ️`);
      return;
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'confirmed' },
    });

    await ctx.answerCbQuery('Order approved successfully! ✅');

    const caption = ctx.callbackQuery.message && 'caption' in ctx.callbackQuery.message
      ? ctx.callbackQuery.message.caption
      : '';
    
    await ctx.editMessageCaption(`${caption}\n\n🟢 <b>Approved by Admin</b>`, {
      parse_mode: 'HTML',
    });
  } catch (error) {
    console.error('Approve callback query error:', error);
    await ctx.answerCbQuery('Error processing request ❌');
  }
});

bot.action(/^reject_order:(.+)$/, async (ctx) => {
  const orderId = ctx.match[1];
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      await ctx.answerCbQuery('Order not found ❌');
      return;
    }

    if (order.status !== 'pending') {
      await ctx.answerCbQuery(`Order is already ${order.status} ℹ️`);
      return;
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'cancelled' },
    });

    await ctx.answerCbQuery('Order rejected ❌');

    const caption = ctx.callbackQuery.message && 'caption' in ctx.callbackQuery.message
      ? ctx.callbackQuery.message.caption
      : '';

    await ctx.editMessageCaption(`${caption}\n\n🔴 <b>Rejected by Admin</b>`, {
      parse_mode: 'HTML',
    });
  } catch (error) {
    console.error('Reject callback query error:', error);
    await ctx.answerCbQuery('Error processing request ❌');
  }
});

// /start command
bot.start(async (ctx) => {
  const firstName = ctx.from.first_name;

  await ctx.reply(
    `What can this bot do?\nWelcome to Bekollo! 🛍️\n\nExperience a faster, easier way to shop. Browse our latest products, securely add items to your cart, and complete your checkout without ever leaving Telegram.\n\nTap the "Shop Now" button below or click "Start" to begin shopping! ✨`
  );

  await ctx.reply(`Let's get started ;)`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🛒 View Store', web_app: { url: WEBAPP_URL } }],
      ],
    },
  });
});

// /help command
bot.help((ctx) => {
  ctx.reply(
    `🛍️ *Bekollo Shopping Bot*\n\nTap the button below to open our store:\n\n/start - Open the store\n/help - Show this help message`,
    { parse_mode: 'Markdown' }
  );
});

// Error handler
bot.catch((err: any) => {
  console.error('Bot error:', err);
});

// Launch
bot
  .launch()
  .then(() => console.log('🤖 Bot started'))
  .catch((err) => console.error('Failed to start bot:', err));

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default bot;
