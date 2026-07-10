'use client';

import React from 'react';
import { ChevronLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/providers/CartProvider';
import { formatPrice, hapticFeedback } from '@/lib/telegram';
import type { Screen } from './ShopApp';

interface CartPageProps {
  navigate: (screen: Screen) => void;
  goBack: () => void;
}

export default function CartPage({ navigate, goBack }: CartPageProps) {
  const { items, count, subtotal, total, loading, updateQuantity, removeFromCart } =
    useCart();

  const handleCheckout = () => {
    hapticFeedback('notification');
    navigate({ name: 'checkout' });
  };

  return (
    <div className="min-h-screen bg-[#F9F9FB] pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between bg-[#F9F9FB]/90 px-4 py-3 backdrop-blur-md border-b border-[#EBEBEB]">
        <button
          onClick={() => {
            hapticFeedback('impact');
            goBack();
          }}
          className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm hover:brightness-95 transition-all tap-active"
          aria-label="Back"
        >
          <ChevronLeft size={20} className="text-[#1A1A1A]" />
        </button>
        <h1 className="text-base font-bold text-[#1A1A1A]">
          Your Cart {count > 0 && <span className="text-[#9CA3AF]">({count})</span>}
        </h1>
        <div className="h-10 w-10" />
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-4">
        {loading && items.length === 0 && (
          <p className="py-16 text-center text-sm text-[#9CA3AF]">Loading…</p>
        )}

        {!loading && items.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-24 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-white shadow-sm">
              <ShoppingBag size={24} className="text-[#1A1A1A]" />
            </div>
            <div>
              <p className="text-base font-semibold text-[#1A1A1A]">
                Your cart is empty
              </p>
              <p className="mt-1 text-sm text-[#9CA3AF]">
                Browse the shop and add your favorites.
              </p>
            </div>
            <button
              onClick={() => {
                hapticFeedback('impact');
                navigate({ name: 'store' });
              }}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#FFD02B] px-6 text-sm font-bold text-[#1A1A1A] hover:bg-[#E5BA20] transition-colors tap-active"
            >
              Continue shopping
            </button>
          </div>
        )}

        {items.length > 0 && (
          <ul className="flex flex-col gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex gap-3 rounded-3xl bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)] border border-[#EBEBEB]"
              >
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#F5F5F7] border border-[#EBEBEB]">
                  {item.product.images?.[0] && (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-sm font-semibold text-[#1A1A1A] leading-snug">
                      {item.product.name}
                    </h3>
                    <button
                      onClick={() => {
                        hapticFeedback('notification');
                        void removeFromCart(item.id);
                      }}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-[#9CA3AF] transition-colors hover:bg-[#F9F9FB] hover:text-[#EF4444] tap-active"
                      aria-label="Remove"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <p className="mt-1 text-xs text-[#6B7280]">
                    {item.size && <span>Size {item.size}</span>}
                    {item.size && item.color && <span> · </span>}
                    {item.color && <span>{item.color}</span>}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="inline-flex items-center gap-3 rounded-full border border-[#EEEEEE] p-1 bg-white">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            hapticFeedback('impact');
                            void updateQuantity(item.id, item.quantity - 1);
                          }
                        }}
                        disabled={item.quantity <= 1}
                        className="grid h-7 w-7 place-items-center rounded-full bg-[#F9F9FB] text-[#1A1A1A] disabled:opacity-40 tap-active"
                        aria-label="Decrease"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="min-w-[20px] text-center text-sm font-bold text-[#1A1A1A]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          hapticFeedback('impact');
                          void updateQuantity(item.id, item.quantity + 1);
                        }}
                        className="grid h-7 w-7 place-items-center rounded-full bg-[#F9F9FB] text-[#1A1A1A] tap-active"
                        aria-label="Increase"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <span className="text-sm font-bold text-[#1A1A1A]">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {items.length > 0 && (
          <section className="mt-6 rounded-3xl bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] border border-[#EBEBEB]">
            <div className="flex items-center justify-between text-sm text-[#6B7280]">
              <span>Subtotal</span>
              <span className="text-[#1A1A1A]">{formatPrice(subtotal)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-[#6B7280]">
              <span>Shipping</span>
              <span className="text-[#1A1A1A]">Calculated at checkout</span>
            </div>
            <div className="my-3 h-px bg-[#EEEEEE]" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#1A1A1A]">Total</span>
              <span className="text-lg font-bold text-[#1A1A1A]">
                {formatPrice(total)}
              </span>
            </div>
          </section>
        )}
      </main>

      {/* Sticky checkout */}
      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#EEEEEE] bg-white/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
            <div className="flex flex-col">
              <span className="text-[11px] text-[#9CA3AF]">Total</span>
              <span className="text-lg font-bold text-[#1A1A1A]">
                {formatPrice(total)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="ml-auto inline-flex h-12 flex-1 items-center justify-center rounded-full bg-[#FFD02B] text-sm font-bold text-[#1A1A1A] transition-colors hover:bg-[#E5BA20] tap-active"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
