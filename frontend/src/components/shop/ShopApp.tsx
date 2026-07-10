'use client';

import React, { useState, useEffect } from 'react';
import { TelegramProvider, useTelegram } from '@/providers/TelegramProvider';
import { ToastProvider } from '@/providers/ToastProvider';
import { CartProvider } from '@/providers/CartProvider';
import WelcomeScreen from './WelcomeScreen';
import StorePage from './StorePage';
import ProductDetail from './ProductDetail';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import CheckoutSuccess from './CheckoutSuccess';
import AccountPage from './AccountPage';
import OrdersPage from './OrdersPage';
import SearchPage from './SearchPage';

export type Screen = 
  | { name: 'welcome' }
  | { name: 'store' }
  | { name: 'product'; slug: string }
  | { name: 'cart' }
  | { name: 'checkout' }
  | { name: 'checkout-success'; orderNumber: string }
  | { name: 'account' }
  | { name: 'orders' }
  | { name: 'search' };

function ShopRouter() {
  const { user, isReady } = useTelegram();
  const [screen, setScreen] = useState<Screen>({ name: 'welcome' });
  const [screenHistory, setScreenHistory] = useState<Screen[]>([]);

  const navigate = (newScreen: Screen) => {
    setScreenHistory(prev => [...prev, screen]);
    setScreen(newScreen);
  };

  const goBack = () => {
    if (screenHistory.length > 0) {
      const prev = screenHistory[screenHistory.length - 1];
      setScreenHistory(h => h.slice(0, -1));
      setScreen(prev);
    }
  };

  // Auto-advance if user already authenticated
  useEffect(() => {
    if (isReady && user && screen.name === 'welcome') {
      // Don't auto-advance, let user click continue
    }
  }, [isReady, user, screen.name]);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-[#FFD02B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (screen.name) {
      case 'welcome':
        return <WelcomeScreen onContinue={() => navigate({ name: 'store' })} />;
      case 'store':
        return <StorePage navigate={navigate} />;
      case 'product':
        return <ProductDetail slug={screen.slug} navigate={navigate} goBack={goBack} />;
      case 'cart':
        return <CartPage navigate={navigate} goBack={goBack} />;
      case 'checkout':
        return <CheckoutPage navigate={navigate} goBack={goBack} />;
      case 'checkout-success':
        return <CheckoutSuccess orderNumber={screen.orderNumber} navigate={navigate} />;
      case 'account':
        return <AccountPage navigate={navigate} goBack={goBack} />;
      case 'orders':
        return <OrdersPage navigate={navigate} goBack={goBack} />;
      case 'search':
        return <SearchPage navigate={navigate} goBack={goBack} />;
      default:
        return <StorePage navigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {renderScreen()}
    </div>
  );
}

export default function ShopApp() {
  return (
    <TelegramProvider>
      <ToastProvider>
        <CartProvider>
          <ShopRouter />
        </CartProvider>
      </ToastProvider>
    </TelegramProvider>
  );
}
