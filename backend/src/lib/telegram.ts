import bot from '../bot';
import { Markup } from 'telegraf';

const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '-1002625554625';

export async function sendOrderReceiptNotification(order: any, user: any) {
  if (!process.env.BOT_TOKEN) {
    console.warn('⚠️ BOT_TOKEN not set. Telegram notification skipped.');
    return;
  }

  const amount = Number(order.total).toFixed(2);
  const senderName = order.senderName || 'Unknown';
  const txId = order.id.toString();
  const dateStr = new Date(order.createdAt).toLocaleString();
  const shipping = typeof order.shippingAddress === 'string' 
    ? JSON.parse(order.shippingAddress) 
    : order.shippingAddress;

  const caption = `
🆕 <b>New Order Receipt Uploaded</b>

🔢 <b>Order Number:</b> ${order.orderNumber}
👤 <b>Customer:</b> ${shipping.name} (${shipping.phone})
📍 <b>Address:</b> ${shipping.address}, ${shipping.city}
💰 <b>Total Amount:</b> ${amount} Br
🏦 <b>Payment Method:</b> ${order.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Telebirr'}
📤 <b>Sender Name:</b> ${senderName}
🔢 <b>Tx Code:</b> ${order.transactionCode || 'N/A'}
📞 <b>Pay Phone:</b> ${order.paymentPhone || 'N/A'}

📅 <b>Date:</b> ${dateStr}
  `.trim();

  try {
    if (order.receiptUrl) {
      console.log(`📸 Sending order receipt to Telegram: ${order.receiptUrl}`);
      await bot.telegram.sendPhoto(
        ADMIN_CHAT_ID,
        order.receiptUrl,
        {
          caption,
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            [
              Markup.button.callback('Approve Order ✅', `approve_order:${txId}`),
              Markup.button.callback('Reject Order ❌', `reject_order:${txId}`)
            ]
          ])
        }
      );
    } else {
      console.log('📝 Sending order text notification (no receipt image)...');
      await bot.telegram.sendMessage(
        ADMIN_CHAT_ID,
        caption,
        {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            [
              Markup.button.callback('Approve Order ✅', `approve_order:${txId}`),
              Markup.button.callback('Reject Order ❌', `reject_order:${txId}`)
            ]
          ])
        }
      );
    }
    console.log('✅ Telegram order receipt notification sent successfully');
  } catch (error) {
    console.error('❌ Failed to send Telegram notification:', error);
  }
}
