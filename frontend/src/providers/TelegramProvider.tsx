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
    // In development, mock the environment
    if (process.env.NODE_ENV === 'development') {
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
  }, []);

  return (
    <TelegramContext.Provider value={{ user, isInTelegram, isReady }}>
      {children}
    </TelegramContext.Provider>
  );
}
