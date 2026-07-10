'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { Category, Product } from '@/types';
import api from '@/lib/api';
import { useCart } from '@/providers/CartProvider';
import { useTelegram } from '@/providers/TelegramProvider';
import { hapticFeedback } from '@/lib/telegram';
import { branding } from '@/config/branding';
import ProductCard from './ProductCard';
import type { Screen } from './ShopApp';
import { ShoppingBag } from 'lucide-react';

const PRICE_RANGES = [
  { label: 'Under 100 Br', min: 0, max: 100 },
  { label: '100 - 500 Br', min: 100, max: 500 },
  { label: '500 - 1000 Br', min: 500, max: 1000 },
  { label: 'Over 1000 Br', min: 1000, max: null },
] as const;

interface StorePageProps {
  navigate: (screen: Screen) => void;
}

function BekolloLogo() {
  return (
    <div className="flex items-center gap-0.5 text-[26px] font-extrabold leading-none tracking-tight text-[#1A1A1A]">
      <span>Bek</span>
      <span className="relative inline-block h-[26px] w-[26px]">
        {/* sun rays */}
        <svg
          viewBox="0 0 32 32"
          className="absolute -top-2 left-1/2 h-[14px] w-[22px] -translate-x-1/2 text-[#FFD02B]"
          fill="currentColor"
          aria-hidden="true"
        >
          {Array.from({ length: 7 }).map((_, i) => {
            const angle = -70 + i * 23;
            const rad = (angle * Math.PI) / 180;
            const x1 = 16 + Math.cos(rad) * 10;
            const y1 = 16 + Math.sin(rad) * 10;
            const x2 = 16 + Math.cos(rad) * 15;
            const y2 = 16 + Math.sin(rad) * 15;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            );
          })}
        </svg>
        {/* smiley face */}
        <span className="absolute inset-0 grid place-items-center rounded-full bg-[#FFD02B]">
          <svg viewBox="0 0 20 20" className="h-3 w-3 text-[#1A1A1A]" aria-hidden="true">
            <circle cx="7" cy="8" r="1.2" fill="currentColor" />
            <circle cx="13" cy="8" r="1.2" fill="currentColor" />
            <path
              d="M6 12 Q10 15 14 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </span>
      <span>llo</span>
    </div>
  );
}

export default function StorePage({ navigate }: StorePageProps) {
  const { user } = useTelegram();
  const { count } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  const [activeCategory, setActiveCategory] = useState<string>('all'); // 'all' | slug
  const [activePriceIdx, setActivePriceIdx] = useState<number | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Load categories and wishlist IDs
  useEffect(() => {
    api.get('/categories')
      .then((r) => setCategories(r.data?.categories ?? []))
      .catch(() => {});
    api.get('/users/wishlist/ids')
      .then((r) => setWishlistIds(r.data?.productIds ?? []))
      .catch(() => {});
  }, []);

  // Products (reset on filter change)
  useEffect(() => {
    setPage(1);
    setProducts([]);
    loadProducts(1, true);
  }, [activeCategory, activePriceIdx]);

  const loadProducts = async (nextPage: number, replace = false) => {
    if (replace) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const price = activePriceIdx != null ? PRICE_RANGES[activePriceIdx] : null;
      const { data } = await api.get('/products', {
        params: {
          page: nextPage,
          limit: 12,
          category: activeCategory === 'all' ? undefined : activeCategory,
          minPrice: price?.min,
          maxPrice: price?.max,
        },
      });

      setProducts((prev) =>
        replace ? data.products ?? [] : [...prev, ...(data.products ?? [])]
      );
      setHasMore(Boolean(data?.pagination?.hasMore));
      setPage(nextPage);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const toggleWishlist = async (productId: string) => {
    try {
      const { data } = await api.post('/users/wishlist', { productId });
      if (data.wishlisted) {
        setWishlistIds((prev) => [...prev, productId]);
      } else {
        setWishlistIds((prev) => prev.filter((id) => id !== productId));
      }
    } catch {
      // silent fail
    }
  };

  const categoryPills = useMemo(
    () => [{ id: 'all', name: 'All', slug: 'all', sortOrder: 0 }, ...categories],
    [categories]
  );

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-[#F9F9FB]/90 backdrop-blur-md border-b border-[#EBEBEB]">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <BekolloLogo />

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                hapticFeedback('impact');
                navigate({ name: 'cart' });
              }}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#1A1A1A] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#333] tap-active"
            >
              <ShoppingBag size={15} strokeWidth={2.2} />
              <span>{branding.cartButton.text}</span>
              {count > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FFD02B] px-1.5 text-[11px] font-bold text-[#1A1A1A]">
                  {count}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                hapticFeedback('impact');
                navigate({ name: 'account' });
              }}
              className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-[#1A1A1A] text-white ring-2 ring-white hover:brightness-95 tap-active"
            >
              {user?.photo_url ? (
                <img
                  src={user.photo_url}
                  alt={user.first_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold">
                  {user?.first_name?.[0]?.toUpperCase() ?? 'B'}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category pills */}
        <div className="mx-auto max-w-2xl overflow-x-auto px-4 pb-2.5 [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-2">
            {categoryPills.map((c) => {
              const active = activeCategory === c.slug;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    hapticFeedback('selection');
                    setActiveCategory(c.slug);
                  }}
                  className={
                    'shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition-colors tap-active ' +
                    (active
                      ? 'bg-[#1A1A1A] text-white'
                      : 'border border-[#EEEEEE] bg-white text-[#1A1A1A] hover:border-[#1A1A1A]/20')
                  }
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price pills */}
        <div className="mx-auto max-w-2xl overflow-x-auto px-4 pb-3.5 [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-2">
            {PRICE_RANGES.map((r, i) => {
              const active = activePriceIdx === i;
              return (
                <button
                  key={r.label}
                  onClick={() => {
                    hapticFeedback('selection');
                    setActivePriceIdx(active ? null : i);
                  }}
                  className={
                    'shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-colors tap-active ' +
                    (active
                      ? 'bg-[#1A1A1A] text-white'
                      : 'border border-[#EEEEEE] bg-white text-[#6B7280] hover:border-[#1A1A1A]/20')
                  }
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-4">
        {loading && products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-[#9CA3AF]">Loading...</p>
          </div>
        ) : products.length === 0 ? (
          <p className="py-16 text-center text-sm text-[#9CA3AF]">
            No products found.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3.5">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isWishlisted={wishlistIds.includes(p.id)}
                  onSelect={() => navigate({ name: 'product', slug: p.slug })}
                  onToggleWishlist={() => toggleWishlist(p.id)}
                />
              ))}
            </div>

            {loadingMore && (
              <p className="py-8 text-center text-sm text-[#9CA3AF]">Loading...</p>
            )}

            {!loadingMore && hasMore && (
              <button
                onClick={() => loadProducts(page + 1)}
                className="mx-auto mt-8 block rounded-full border border-[#EEEEEE] bg-white px-6 py-2.5 text-sm font-semibold text-[#1A1A1A] hover:border-[#1A1A1A]/20 transition-colors tap-active"
              >
                Load more
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}
