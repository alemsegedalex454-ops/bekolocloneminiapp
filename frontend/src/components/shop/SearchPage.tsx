'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { branding } from '@/config/branding';
import api from '@/lib/api';
import type { Product } from '@/types';
import type { Screen } from './ShopApp';
import ProductCard from './ProductCard';

interface SearchPageProps {
  navigate: (screen: Screen) => void;
  goBack: () => void;
}

export default function SearchPage({ navigate, goBack }: SearchPageProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    try {
      setLoading(true);
      const { data } = await api.get('/products', { params: { search: q, limit: 20 } });
      setResults(data.products);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => search(query), 300);
    return () => clearTimeout(timeout);
  }, [query, search]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b px-4 py-3 flex items-center gap-3"
        style={{ borderColor: branding.colors.border }}>
        <button onClick={goBack} className="tap-active p-1 flex-shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={branding.colors.text} strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            autoFocus
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border outline-none focus:ring-2"
            style={{
              backgroundColor: branding.colors.surface,
              borderColor: branding.colors.border,
              color: branding.colors.text,
            }}
          />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={branding.colors.textMuted} strokeWidth="2"
            className="absolute left-3 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
      </div>

      {/* Results */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-2"
              style={{ borderColor: branding.colors.primary, borderTopColor: 'transparent' }} />
            <p className="text-sm" style={{ color: branding.colors.textMuted }}>Searching...</p>
          </div>
        ) : query && results.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg mb-1" style={{ color: branding.colors.textSecondary }}>No results</p>
            <p className="text-sm" style={{ color: branding.colors.textMuted }}>
              Try a different search term
            </p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {results.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={() => navigate({ name: 'product', slug: product.slug })}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={branding.colors.textMuted} strokeWidth="1.5" className="mx-auto mb-4">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <p className="text-sm" style={{ color: branding.colors.textMuted }}>
              Search for products by name
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
