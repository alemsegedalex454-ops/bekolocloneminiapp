import { Telegraf, Markup } from 'telegraf';

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://your-domain.com';

if (!BOT_TOKEN) {
  console.warn('⚠️  BOT_TOKEN not set. Telegram bot will not start.');
  process.exit(0);
}

const bot = new Telegraf(BOT_TOKEN);

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
