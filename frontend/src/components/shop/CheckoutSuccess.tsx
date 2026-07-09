'use client';

import React from 'react';
import { branding } from '@/config/branding';
import type { Screen } from './ShopApp';

interface CheckoutSuccessProps {
  orderNumber: string;
  navigate: (screen: Screen) => void;
}

export default function CheckoutSuccess({ orderNumber, navigate }: CheckoutSuccessProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      {/* Success animation */}
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 animate-bounce-in"
        style={{ backgroundColor: `${branding.colors.success}15` }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={branding.colors.success} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold mb-2 animate-fade-in-up" style={{ color: branding.colors.text }}>
        Order Placed! 🎉
      </h1>

      <p className="text-sm text-center mb-2 animate-fade-in-up" style={{ color: branding.colors.textSecondary, animationDelay: '100ms' }}>
        Your order has been placed successfully.
      </p>

      <div className="px-4 py-2 rounded-lg mb-8 animate-fade-in-up" style={{ backgroundColor: branding.colors.surface, animationDelay: '200ms' }}>
        <p className="text-xs" style={{ color: branding.colors.textSecondary }}>Order Number</p>
        <p className="text-base font-bold font-mono" style={{ color: branding.colors.text }}>{orderNumber}</p>
      </div>

      <div className="w-full space-y-3 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
        <button
          onClick={() => navigate({ name: 'orders' })}
          className="w-full py-3.5 rounded-xl text-sm font-bold tap-active"
          style={{
            backgroundColor: branding.colors.primary,
            color: branding.colors.primaryText,
          }}
        >
          View My Orders
        </button>

        <button
          onClick={() => navigate({ name: 'store' })}
          className="w-full py-3.5 rounded-xl text-sm font-bold tap-active border"
          style={{
            backgroundColor: 'transparent',
            color: branding.colors.text,
            borderColor: branding.colors.border,
          }}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
