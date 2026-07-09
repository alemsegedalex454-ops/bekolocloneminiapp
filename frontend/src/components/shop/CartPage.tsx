'use client';

import React from 'react';
import { branding } from '@/config/branding';
import { formatPrice } from '@/lib/telegram';
import { useCart } from '@/providers/CartProvider';
import type { Screen } from './ShopApp';

interface CartPageProps {
  navigate: (screen: Screen) => void;
  goBack: () => void;
}

export default function CartPage({ navigate, goBack }: CartPageProps) {
  const { items, subtotal, total, updateQuantity, removeFromCart } = useCart();

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b px-4 py-3 flex items-center gap-3"
        style={{ borderColor: branding.colors.border }}>
        <button onClick={goBack} className="tap-active p-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={branding.colors.text} strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-bold" style={{ color: branding.colors.text }}>
          Shopping Cart ({items.length})
        </h2>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={branding.colors.textMuted} strokeWidth="1.5" className="mb-4">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          <p className="text-lg font-semibold mb-1" style={{ color: branding.colors.textSecondary }}>
            Your cart is empty
          </p>
          <p className="text-sm mb-6" style={{ color: branding.colors.textMuted }}>
            Add some products to get started
          </p>
          <button
            onClick={() => navigate({ name: 'store' })}
            className="px-6 py-2.5 rounded-full text-sm font-semibold tap-active"
            style={{
              backgroundColor: branding.colors.primary,
              color: branding.colors.primaryText,
            }}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="divide-y" style={{ borderColor: branding.colors.border }}>
            {items.map((item) => {
              const image = Array.isArray(item.product.images) && item.product.images.length > 0
                ? item.product.images[0]
                : '/placeholder.png';

              return (
                <div key={item.id} className="px-4 py-4 flex gap-3 animate-fade-in">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                    <img src={image} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium mb-1 truncate" style={{ color: branding.colors.text }}>
                      {item.product.name}
                    </h3>
                    
                    <div className="flex gap-2 text-xs mb-2" style={{ color: branding.colors.textSecondary }}>
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>

                    <p className="text-sm font-bold" style={{ color: branding.colors.text }}>
                      {formatPrice(item.product.price)}
                    </p>
                  </div>

                  {/* Quantity & Remove */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="tap-active p-1"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={branding.colors.textMuted} strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold tap-active"
                        style={{ backgroundColor: branding.colors.surface }}
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold tap-active"
                        style={{ backgroundColor: branding.colors.surface }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Fixed Checkout Bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50"
          style={{ borderColor: branding.colors.border }}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm" style={{ color: branding.colors.textSecondary }}>Subtotal</span>
            <span className="text-sm font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-base font-bold" style={{ color: branding.colors.text }}>Total</span>
            <span className="text-lg font-bold" style={{ color: branding.colors.text }}>
              {formatPrice(total)}
            </span>
          </div>
          <button
            onClick={() => navigate({ name: 'checkout' })}
            className="w-full py-3.5 rounded-xl text-[15px] font-bold transition-all tap-active"
            style={{
              backgroundColor: branding.colors.primary,
              color: branding.colors.primaryText,
            }}
          >
            Checkout
          </button>
        </div>
      )}
    </div>
  );
}
