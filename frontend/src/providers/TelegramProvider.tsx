'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTelegramUser, isTelegramEnvironment, expandMiniApp, signalReady, setHeaderColor, mockTelegramEnv } from '@/lib/telegram';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

interface TelegramContextType {
  user: TelegramUser | null;
  isInTelegram: boolean;
  isReady: boolean;
}

const TelegramContext = createContext<TelegramContextType>({
  user: null,
  isInTelegram: false,
  isReady: false,
});

export function useTelegram() {
  return useContext(TelegramContext);
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isInTelegram, setIsInTelegram] = useState(false);

  useEffect(() => {
    const initTelegram = () => {
      if (process.env.NODE_ENV === 'development' && !(window as any).Telegram?.WebApp?.initData) {
        mockTelegramEnv();
      }

      const inTelegram = isTelegramEnvironment();
      setIsInTelegram(inTelegram);

      const tgUser = getTelegramUser();
      if (tgUser) {
        setUser(tgUser);
      }

      // Tell Telegram we're ready
      signalReady();
      expandMiniApp();
      setHeaderColor('#FFFFFF');
      setIsReady(true);
    };

    // If script is already fully loaded
    if (typeof window !== 'undefined' && ((window as any).Telegram?.WebApp || process.env.NODE_ENV === 'development')) {
      initTelegram();
    } else {
      // Poll every 50ms for up to 1 second to wait for async script injection
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if ((window as any).Telegram?.WebApp || attempts > 20) {
          clearInterval(interval);
          initTelegram();
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ user, isInTelegram, isReady }}>
      {children}
    </TelegramContext.Provider>
  );
}
