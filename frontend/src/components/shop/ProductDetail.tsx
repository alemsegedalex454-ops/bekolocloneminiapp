'use client';

import React, { useState, useEffect } from 'react';
import { Minus, Plus, ChevronLeft, Heart } from 'lucide-react';
import type { Product } from '@/types';
import { useCart } from '@/providers/CartProvider';
import { formatPrice, hapticFeedback } from '@/lib/telegram';
import api from '@/lib/api';
import type { Screen } from './ShopApp';

interface ProductDetailProps {
  slug: string;
  navigate: (screen: Screen) => void;
  goBack: () => void;
}

export default function ProductDetail({ slug, navigate, goBack }: ProductDetailProps) {
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${slug}`)
      .then(({ data }) => {
        setProduct(data.product);
        if (data.product.sizes?.length) setSize(data.product.sizes[0]);
        if (data.product.colors?.length) setColor(data.product.colors[0].name);
        
        // Check if wishlisted
        api.get('/users/wishlist/ids')
          .then((r) => {
            const ids = r.data?.productIds ?? [];
            setIsWishlisted(ids.includes(data.product.id));
          })
          .catch(() => {});

        // Track recently viewed
        api.post('/users/recently-viewed', { productId: data.product.id }).catch(() => {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const toggleWishlist = async () => {
    if (!product) return;
    hapticFeedback('selection');
    // optimistic update
    setIsWishlisted((prev) => !prev);
    try {
      await api.post('/users/wishlist', { productId: product.id });
    } catch {
      // rollback
      setIsWishlisted((prev) => !prev);
    }
  };

  const handleAdd = async () => {
    if (!product || adding || product.stock <= 0) return;
    setAdding(true);
    hapticFeedback('notification');
    try {
      await addToCart(product.id, qty, size, color);
    } finally {
      setAdding(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F9FB]">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-[#FFD02B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#F9F9FB] overflow-y-auto pb-36 no-scrollbar">
      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between bg-[#F9F9FB]/90 px-4 py-3 backdrop-blur-md">
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
        <button
          onClick={toggleWishlist}
          className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm hover:brightness-95 transition-all tap-active"
          aria-label="Wishlist"
        >
          <Heart
            size={18}
            className="text-[#1A1A1A]"
            fill={isWishlisted ? '#EF4444' : 'none'}
            stroke={isWishlisted ? '#EF4444' : '#1A1A1A'}
          />
        </button>
      </div>

      {/* Gallery */}
      <div className="mx-auto max-w-2xl px-4">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-white border border-[#EBEBEB] shadow-sm">
          {product.images?.[activeImage] && (
            <img
              src={product.images[activeImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {product.images?.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
            {product.images.map((src, i) => (
              <button
                key={src}
                onClick={() => setActiveImage(i)}
                className={
                  'relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-colors tap-active ' +
                  (i === activeImage ? 'border-[#1A1A1A]' : 'border-transparent')
                }
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-6 flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold leading-tight text-[#1A1A1A]">
            {product.name}
          </h1>
          <div className="text-right shrink-0">
            {product.comparePrice && product.comparePrice > product.price && (
              <div className="text-xs text-[#9CA3AF] line-through">
                {formatPrice(product.comparePrice)}
              </div>
            )}
            <div className="text-xl font-bold text-[#1A1A1A]">
              {formatPrice(product.price)}
            </div>
          </div>
        </div>

        {product.description && (
          <p className="mt-3 text-sm leading-relaxed text-[#6B7280]">
            {product.description}
          </p>
        )}

        {/* Sizes */}
        {product.sizes?.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-[#1A1A1A]">Size</h2>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => {
                const active = s === size;
                return (
                  <button
                    key={s}
                    onClick={() => {
                      hapticFeedback('selection');
                      setSize(s);
                    }}
                    className={
                      'min-w-[48px] rounded-full px-4 py-2.5 text-sm font-semibold transition-colors tap-active ' +
                      (active
                        ? 'bg-[#1A1A1A] text-white'
                        : 'border border-[#EEEEEE] bg-white text-[#1A1A1A] hover:border-[#1A1A1A]/20')
                    }
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Colors */}
        {product.colors?.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 text-sm font-semibold text-[#1A1A1A]">
              Color <span className="font-normal text-[#9CA3AF]">· {color}</span>
            </h2>
            <div className="flex flex-wrap gap-3">
              {product.colors.map((c) => {
                const active = c.name === color;
                return (
                  <button
                    key={c.name}
                    onClick={() => {
                      hapticFeedback('selection');
                      setColor(c.name);
                    }}
                    aria-label={c.name}
                    className={
                      'grid h-10 w-10 place-items-center rounded-full transition-transform tap-active ' +
                      (active
                        ? 'ring-2 ring-[#1A1A1A] ring-offset-2 ring-offset-[#F9F9FB]'
                        : 'ring-1 ring-[#EEEEEE]')
                    }
                    style={{ backgroundColor: c.hex }}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Quantity */}
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-[#1A1A1A]">Quantity</h2>
          <div className="inline-flex items-center gap-4 rounded-full border border-[#EEEEEE] bg-white p-1.5 shadow-sm">
            <button
              onClick={() => {
                if (qty > 1) {
                  setQty(qty - 1);
                  hapticFeedback('impact');
                }
              }}
              className="grid h-9 w-9 place-items-center rounded-full bg-[#F9F9FB] text-[#1A1A1A] disabled:opacity-40 tap-active"
              disabled={qty <= 1}
              aria-label="Decrease"
            >
              <Minus size={16} />
            </button>
            <span className="min-w-[24px] text-center text-sm font-bold text-[#1A1A1A]">
              {qty}
            </span>
            <button
              onClick={() => {
                if (qty < product.stock) {
                  setQty(qty + 1);
                  hapticFeedback('impact');
                }
              }}
              className="grid h-9 w-9 place-items-center rounded-full bg-[#F9F9FB] text-[#1A1A1A] disabled:opacity-40 tap-active"
              disabled={qty >= product.stock}
              aria-label="Increase"
            >
              <Plus size={16} />
            </button>
          </div>
        </section>
      </div>

      {/* Sticky bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#EEEEEE] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          <div className="flex flex-col">
            <span className="text-[11px] text-[#9CA3AF]">Total</span>
            <span className="text-lg font-bold text-[#1A1A1A]">
              {formatPrice(product.price * qty)}
            </span>
          </div>
          <button
            onClick={handleAdd}
            disabled={adding || product.stock <= 0}
            className="ml-auto inline-flex h-12 flex-1 items-center justify-center rounded-full bg-[#FFD02B] text-sm font-bold text-[#1A1A1A] transition-colors hover:bg-[#E5BA20] disabled:opacity-60 tap-active"
          >
            {product.stock <= 0 ? 'Out of stock' : adding ? 'Adding…' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
