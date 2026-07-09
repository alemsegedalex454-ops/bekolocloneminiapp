import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bekollo | ዋጋው! Online Shop',
  description: 'Experience a faster, easier way to shop. Browse our latest products, securely add items to your cart, and complete your checkout without ever leaving Telegram.',
  keywords: ['shopping', 'telegram', 'mini app', 'e-commerce', 'online store'],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#FFFFFF',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" defer />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
