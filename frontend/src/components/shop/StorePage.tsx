'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/providers/CartProvider';
import { useTelegram } from '@/providers/TelegramProvider';
import api from '@/lib/api';
import { Product, Category } from '@/types';
import ProductCard from './ProductCard';
import { BekolloLogo } from './BekolloLogo';
import { hapticFeedback } from '@/lib/telegram';
import { branding } from '@/config/branding';
import type { Screen } from './ShopApp';

const PRICE_RANGES = [
  { label: 'Under 100 Br', min: 0,    max: 100 },
  { label: '100 - 500 Br', min: 100,  max: 500 },
  { label: '500 - 1000 Br',min: 500,  max: 1000 },
  { label: 'Over 1000 Br', min: 1000, max: undefined },
];

interface StorePageProps {
  navigate: (screen: Screen) => void;
}

export default function StorePage({ navigate }: StorePageProps) {
  const { count } = useCart();
  const { user } = useTelegram();

  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCat, setActiveCat] = useState<string>('all');
  const [priceIdx, setPriceIdx] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [wishIds, setWishIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [catsRes, wishRes] = await Promise.all([
          api.get('/categories'),
          api.get('/users/wishlist/ids').catch(() => ({ data: { productIds: [] } })),
        ]);
        setCategories(catsRes.data?.categories ?? catsRes.data ?? []);
        setWishIds(wishRes.data?.productIds ?? []);
      } catch {}
    })();
  }, []);

  const load = useCallback(async (replace = false, pageNum = 1) => {
    setLoading(true);
    try {
      const range = priceIdx !== null ? PRICE_RANGES[priceIdx] : null;
      const res = await api.get('/products', {
        params: {
          page: pageNum,
          limit: 10,
          category: activeCat !== 'all' ? activeCat : undefined,
          minPrice: range?.min,
          maxPrice: range?.max,
        },
      });
      const data = res.data;
      setProducts((prev) => (replace ? data.products ?? [] : [...prev, ...(data.products ?? [])]));
      setHasMore(Boolean(data?.pagination?.hasMore ?? data?.hasMore));
      setPage(pageNum);
    } finally {
      setLoading(false);
    }
  }, [activeCat, priceIdx]);

  useEffect(() => {
    load(true, 1);
  }, [load]);

  useEffect(() => {
    const onScroll = () => {
      if (loading || !hasMore) return;
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 400) {
        load(false, page + 1);
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [loading, hasMore, page, load]);

  const toggleWishlist = async (productId: string) => {
    try {
      const { data } = await api.post('/users/wishlist', { productId });
      if (data.wishlisted) {
        setWishIds((prev) => [...prev, productId]);
      } else {
        setWishIds((prev) => prev.filter((id) => id !== productId));
      }
    } catch {
      // silent rollback
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      {/* Sticky header */}
      <header className="sticky top-0 z-30 bg-[#F9F9FB]/95 backdrop-blur px-4 pt-4 pb-3 border-b border-[#EBEBEB]">
        <div className="flex items-center justify-between">
          <BekolloLogo />
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                hapticFeedback('impact');
                navigate({ name: 'cart' });
              }}
              className="flex h-11 items-center gap-2 rounded-full bg-black px-4 text-white hover:bg-neutral-800 transition-colors tap-active"
            >
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={2} />
              <span className="text-[15px] font-semibold">{branding.cartButton.text}</span>
              {count > 0 && (
                <span className="ml-1 rounded-full bg-[#FFD02B] px-1.5 text-[11px] font-bold text-black animate-scale-in">
                  {count}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                hapticFeedback('impact');
                navigate({ name: 'account' });
              }}
              className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-black text-white ring-2 ring-white hover:brightness-95 tap-active"
            >
              {user?.photo_url ? (
                <img
                  src={user.photo_url}
                  alt="You"
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
        <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
          <CategoryPill active={activeCat === 'all'} onClick={() => setActiveCat('all')}>All</CategoryPill>
          {categories.map((c) => (
            <CategoryPill key={c.id} active={activeCat === c.slug} onClick={() => setActiveCat(c.slug)}>
              {c.name}
            </CategoryPill>
          ))}
        </div>

        {/* Price pills */}
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {PRICE_RANGES.map((r, i) => (
            <button
              key={r.label}
              onClick={() => {
                hapticFeedback('selection');
                setPriceIdx(priceIdx === i ? null : i);
              }}
              className={`h-9 shrink-0 rounded-full border px-4 text-[13px] transition tap-active ${
                priceIdx === i
                  ? 'border-black bg-black text-white'
                  : 'border-neutral-200 bg-white text-neutral-500'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </header>

      {/* Grid */}
      <main className="px-4 pt-3 pb-10">
        <div className="grid grid-cols-2 gap-3">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              isWishlisted={wishIds.includes(p.id)}
              onSelect={() => navigate({ name: 'product', slug: p.slug })}
              onToggleWishlist={() => toggleWishlist(p.id)}
            />
          ))}
        </div>
        {loading && (
          <p className="mt-8 text-center text-[15px] text-neutral-400">Loading...</p>
        )}
      </main>
    </div>
  );
}

function CategoryPill({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={() => {
        hapticFeedback('selection');
        onClick();
      }}
      className={`h-11 shrink-0 rounded-full px-6 text-[16px] font-semibold transition tap-active ${
        active ? 'bg-black text-white' : 'bg-transparent text-neutral-500'
      }`}
    >
      {children}
    </button>
  );
}
