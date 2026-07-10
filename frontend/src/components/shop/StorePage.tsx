'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { branding } from '@/config/branding';
import { useCart } from '@/providers/CartProvider';
import { useTelegram } from '@/providers/TelegramProvider';
import api from '@/lib/api';
import type { Product, Category } from '@/types';
import type { Screen } from './ShopApp';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';

interface StorePageProps {
  navigate: (screen: Screen) => void;
}

const PRICE_FILTERS = [
  { label: 'Under 100 Br', min: 0, max: 100 },
  { label: '100 - 500 Br', min: 100, max: 500 },
  { label: '500 - 1000 Br', min: 500, max: 1000 },
  { label: 'Over 1000 Br', min: 1000, max: null },
];

export default function StorePage({ navigate }: StorePageProps) {
  const { count } = useCart();
  const { user } = useTelegram();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activePriceFilter, setActivePriceFilter] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch categories
  useEffect(() => {
    api.get('/categories').then(({ data }) => {
      setCategories(data.categories || []);
    }).catch(() => {});
  }, []);

  // Fetch wishlist IDs
  useEffect(() => {
    api.get('/users/wishlist/ids').then(({ data }) => {
      setWishlistIds(data.productIds || []);
    }).catch(() => {});
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async (pageNum: number, reset: boolean = false) => {
    try {
      if (reset) setLoading(true);
      else setLoadingMore(true);

      const params: any = { page: pageNum, limit: 20 };
      if (activeCategory !== 'all') params.category = activeCategory;
      if (activePriceFilter !== null) {
        const filter = PRICE_FILTERS[activePriceFilter];
        params.minPrice = filter.min;
        if (filter.max) params.maxPrice = filter.max;
      }

      const { data } = await api.get('/products', { params });
      
      if (reset) {
        setProducts(data.products);
      } else {
        setProducts(prev => [...prev, ...data.products]);
      }
      setHasMore(data.pagination.hasMore);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [activeCategory, activePriceFilter]);

  // Reset and fetch on filter change
  useEffect(() => {
    setPage(1);
    fetchProducts(1, true);
  }, [activeCategory, activePriceFilter, fetchProducts]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchProducts(nextPage);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, loadingMore, loading, page, fetchProducts]);

  const toggleWishlist = async (productId: string) => {
    try {
      const { data } = await api.post('/users/wishlist', { productId });
      if (data.wishlisted) {
        setWishlistIds(prev => [...prev, productId]);
      } else {
        setWishlistIds(prev => prev.filter(id => id !== productId));
      }
    } catch {
      // silent fail
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white border-b px-4 py-3"
        style={{ borderColor: '#EBEBEB' }}>
        <div className="flex items-center justify-between">
          {/* Logo */}
          <h1 className="text-2xl font-bold flex items-center" style={{ color: branding.colors.text }}>
            {branding.storeName.split('').map((char, i) => {
              if (char.toLowerCase() === 'o' && i === 3) {
                return (
                  <span key={i} className="inline-flex items-center mx-0.5 align-middle select-none">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="-mt-1">
                      {/* Rays */}
                      <path d="M12 5V2.5" stroke="#FFD02B" strokeWidth="2.2" strokeLinecap="round" />
                      <path d="M7.76 9.76L5.64 7.64" stroke="#FFD02B" strokeWidth="2.2" strokeLinecap="round" />
                      <path d="M16.24 9.76L18.36 7.64" stroke="#FFD02B" strokeWidth="2.2" strokeLinecap="round" />
                      <path d="M6 14H3" stroke="#FFD02B" strokeWidth="2.2" strokeLinecap="round" />
                      <path d="M18 14H21" stroke="#FFD02B" strokeWidth="2.2" strokeLinecap="round" />
                      {/* Sun Face */}
                      <circle cx="12" cy="14" r="5.5" fill="#FFD02B" />
                      {/* Eyes */}
                      <circle cx="9.8" cy="13.2" r="0.75" fill="#1A1A1A" />
                      <circle cx="14.2" cy="13.2" r="0.75" fill="#1A1A1A" />
                      {/* Smile */}
                      <path d="M9.5 15.5C10.2 16.8 13.8 16.8 14.5 15.5" stroke="#1A1A1A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                    </svg>
                  </span>
                );
              }
              return (
                <span key={i}>
                  {char}
                </span>
              );
            })}
          </h1>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cart button */}
            <button
              onClick={() => navigate({ name: 'cart' })}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-[#0C0C0C] text-white tap-active transition-all"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              {branding.cartButton.text}
              {count > 0 && (
                <span className="bg-white text-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </button>

            {/* User avatar */}
            <button
              onClick={() => navigate({ name: 'account' })}
              className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-100 tap-active shadow-sm"
            >
              {user?.photo_url ? (
                <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Category Tabs + Price Filters */}
      <div className="sticky top-[57px] z-40 bg-white px-4 pt-3 pb-2.5"
        style={{ borderBottom: '1px solid #EBEBEB' }}>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          <button
            onClick={() => setActiveCategory('all')}
            className="px-5 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all tap-active flex-shrink-0"
            style={{
              backgroundColor: activeCategory === 'all' ? '#1A1A1A' : 'transparent',
              color: activeCategory === 'all' ? '#FFFFFF' : '#1A1A1A',
              border: `1.5px solid ${activeCategory === 'all' ? '#1A1A1A' : '#D1D5DB'}`,
            }}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className="px-5 py-2 rounded-full text-[13px] font-medium whitespace-nowrap transition-all tap-active flex-shrink-0"
              style={{
                backgroundColor: activeCategory === cat.slug ? '#1A1A1A' : 'transparent',
                color: activeCategory === cat.slug ? '#FFFFFF' : '#1A1A1A',
                border: `1.5px solid ${activeCategory === cat.slug ? '#1A1A1A' : '#D1D5DB'}`,
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Price Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {PRICE_FILTERS.map((filter, index) => (
            <button
              key={index}
              onClick={() => setActivePriceFilter(activePriceFilter === index ? null : index)}
              className="px-3.5 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all tap-active flex-shrink-0"
              style={{
                backgroundColor: activePriceFilter === index ? '#F3F4F6' : 'transparent',
                color: activePriceFilter === index ? '#1A1A1A' : '#6B7280',
                border: `1px solid ${activePriceFilter === index ? '#D1D5DB' : '#E5E7EB'}`,
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-4 pt-4 pb-8">
        {loading ? (
          <div className="grid grid-cols-2 gap-3.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg mb-1" style={{ color: branding.colors.textSecondary }}>No products found</p>
            <p className="text-sm" style={{ color: branding.colors.textMuted }}>Try a different category or filter</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3.5">
              {products.map((product, index) => (
                <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${(index % 6) * 50}ms` }}>
                  <ProductCard
                    product={product}
                    isWishlisted={wishlistIds.includes(product.id)}
                    onSelect={() => navigate({ name: 'product', slug: product.slug })}
                    onToggleWishlist={() => toggleWishlist(product.id)}
                  />
                </div>
              ))}
            </div>

            {/* Load more trigger */}
            <div ref={loadMoreRef} className="py-6 text-center">
              {loadingMore && (
                <p className="text-sm" style={{ color: branding.colors.textMuted }}>Loading...</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
