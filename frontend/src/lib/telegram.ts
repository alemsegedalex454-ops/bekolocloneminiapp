'use client';

import { branding } from '@/config/branding';

/**
 * Format a price with the store's currency
 */
export function formatPrice(price: number): string {
  const { symbol, position } = branding.currency;
  const formatted = price.toLocaleString();
  return position === 'before' ? `${symbol} ${formatted}` : `${formatted} ${symbol}`;
}

/**
 * Get Telegram WebApp instance
 */
export function getTelegramWebApp() {
  if (typeof window === 'undefined') return null;
  return (window as any).Telegram?.WebApp || null;
}

/**
 * Get Telegram user data
 */
export function getTelegramUser() {
  const tg = getTelegramWebApp();
  if (!tg?.initDataUnsafe?.user) return null;
  return tg.initDataUnsafe.user;
}

/**
 * Check if running inside Telegram
 */
export function isTelegramEnvironment(): boolean {
  const tg = getTelegramWebApp();
  return !!tg?.initData;
}

/**
 * Trigger Telegram haptic feedback
 */
export function hapticFeedback(type: 'impact' | 'notification' | 'selection' = 'impact') {
  const tg = getTelegramWebApp();
  if (!tg?.HapticFeedback) return;
  
  switch (type) {
    case 'impact':
      tg.HapticFeedback.impactOccurred('light');
      break;
    case 'notification':
      tg.HapticFeedback.notificationOccurred('success');
      break;
    case 'selection':
      tg.HapticFeedback.selectionChanged();
      break;
  }
}

/**
 * Expand the Mini App to full height
 */
export function expandMiniApp() {
  const tg = getTelegramWebApp();
  if (tg?.expand) {
    tg.expand();
  }
}

/**
 * Close the Mini App
 */
export function closeMiniApp() {
  const tg = getTelegramWebApp();
  if (tg?.close) {
    tg.close();
  }
}

/**
 * Set the Telegram header color
 */
export function setHeaderColor(color: string) {
  const tg = getTelegramWebApp();
  if (tg?.setHeaderColor) {
    tg.setHeaderColor(color);
  }
}

/**
 * Tell Telegram that the app is ready
 */
export function signalReady() {
  const tg = getTelegramWebApp();
  if (tg?.ready) {
    tg.ready();
  }
}

/**
 * Mock Telegram environment for development
 */
export function mockTelegramEnv() {
  if (typeof window === 'undefined') return;
  if ((window as any).Telegram?.WebApp) return; // Already in Telegram

  (window as any).Telegram = {
    WebApp: {
      initData: 'mock_init_data',
      initDataUnsafe: {
        user: {
          id: 123456789,
          first_name: 'Dev',
          last_name: 'User',
          username: 'devuser',
          language_code: 'en',
          photo_url: null,
        },
        auth_date: Math.floor(Date.now() / 1000),
        hash: 'mock_hash',
      },
      ready: () => {},
      expand: () => {},
      close: () => {},
      setHeaderColor: () => {},
      HapticFeedback: {
        impactOccurred: () => {},
        notificationOccurred: () => {},
        selectionChanged: () => {},
      },
      MainButton: {
        show: () => {},
        hide: () => {},
        setText: () => {},
        onClick: () => {},
        offClick: () => {},
      },
      BackButton: {
        show: () => {},
        hide: () => {},
        onClick: () => {},
        offClick: () => {},
      },
      themeParams: {
        bg_color: '#ffffff',
        text_color: '#000000',
        hint_color: '#999999',
        link_color: '#2678b6',
        button_color: '#3390ec',
        button_text_color: '#ffffff',
      },
      colorScheme: 'light',
      version: '7.0',
      platform: 'web',
    },
  };
}
