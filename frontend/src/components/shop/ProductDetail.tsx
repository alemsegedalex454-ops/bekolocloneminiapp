'use client';

import React, { useState, useEffect } from 'react';
import { branding } from '@/config/branding';
import { formatPrice } from '@/lib/telegram';
import { useCart } from '@/providers/CartProvider';
import api from '@/lib/api';
import type { Product } from '@/types';
import type { Screen } from './ShopApp';
import ProductCard from './ProductCard';

interface ProductDetailProps {
  slug: string;
  navigate: (screen: Screen) => void;
  goBack: () => void;
}

export default function ProductDetail({ slug, navigate, goBack }: ProductDetailProps) {
  const { addToCart, loading: cartLoading } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${slug}`)
      .then(({ data }) => {
        setProduct(data.product);
        setRelated(data.related || []);
        if (data.product.sizes?.length) setSelectedSize(data.product.sizes[0]);
        if (data.product.colors?.length) setSelectedColor(data.product.colors[0].name);
        // Track recently viewed
        api.post('/users/recently-viewed', { productId: data.product.id }).catch(() => {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product.id, quantity, selectedSize, selectedColor);
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-4">
          <button onClick={goBack} className="mb-4 tap-active">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={branding.colors.text} strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <div className="aspect-square skeleton mx-4 rounded-2xl" />
        <div className="p-4 space-y-3">
          <div className="h-6 skeleton w-3/4" />
          <div className="h-8 skeleton w-1/3" />
          <div className="h-4 skeleton w-full" />
          <div className="h-4 skeleton w-2/3" />
        </div>
      </div>
    );
  }

  const images = Array.isArray(product.images) ? product.images : [];

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Back button */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-b"
        style={{ borderColor: branding.colors.border }}>
        <button onClick={goBack} className="tap-active p-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={branding.colors.text} strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-sm font-semibold truncate max-w-[200px]" style={{ color: branding.colors.text }}>
          {product.name}
        </h2>
        <button onClick={() => navigate({ name: 'cart' })} className="tap-active p-1">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={branding.colors.text} strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
        </button>
      </div>

      {/* Image Gallery */}
      <div className="relative">
        <div className="aspect-square bg-gray-50 overflow-hidden">
          <img
            src={images[currentImage] || '/placeholder.png'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        {/* Image dots */}
        {images.length > 1 && (
          <div className="flex gap-1.5 justify-center py-3">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentImage(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  backgroundColor: i === currentImage ? branding.colors.primary : branding.colors.border,
                  transform: i === currentImage ? 'scale(1.3)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold mb-2" style={{ color: branding.colors.text }}>
          {product.name}
        </h1>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold" style={{ color: branding.colors.text }}>
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-base line-through" style={{ color: branding.colors.textMuted }}>
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {product.description && (
          <p className="text-sm leading-relaxed mb-6" style={{ color: branding.colors.textSecondary }}>
            {product.description}
          </p>
        )}

        {/* Size Selection */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="mb-5">
            <h3 className="text-sm font-semibold mb-2" style={{ color: branding.colors.text }}>Size</h3>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all tap-active"
                  style={{
                    backgroundColor: selectedSize === size ? branding.colors.secondary : branding.colors.surface,
                    color: selectedSize === size ? '#FFFFFF' : branding.colors.text,
                    border: `1px solid ${selectedSize === size ? branding.colors.secondary : branding.colors.border}`,
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color Selection */}
        {product.colors && product.colors.length > 0 && (
          <div className="mb-5">
            <h3 className="text-sm font-semibold mb-2" style={{ color: branding.colors.text }}>
              Color: {selectedColor}
            </h3>
            <div className="flex gap-2.5 flex-wrap">
              {product.colors.map((color: any) => (
                <button
                  key={color.name}
                  onClick={() => setSelectedColor(color.name)}
                  className="w-9 h-9 rounded-full transition-all tap-active"
                  style={{
                    backgroundColor: color.hex,
                    border: selectedColor === color.name
                      ? `3px solid ${branding.colors.secondary}`
                      : '2px solid #E5E7EB',
                    transform: selectedColor === color.name ? 'scale(1.1)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-2" style={{ color: branding.colors.text }}>Quantity</h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold tap-active"
              style={{ backgroundColor: branding.colors.surface, color: branding.colors.text }}
            >
              −
            </button>
            <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold tap-active"
              style={{ backgroundColor: branding.colors.surface, color: branding.colors.text }}
            >
              +
            </button>
            <span className="text-xs ml-2" style={{ color: branding.colors.textMuted }}>
              {product.stock} available
            </span>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-8 mb-6">
            <h3 className="text-base font-bold mb-3" style={{ color: branding.colors.text }}>
              You may also like
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelect={() => navigate({ name: 'product', slug: p.slug })}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Add to Cart */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50"
        style={{ borderColor: branding.colors.border }}>
        <button
          onClick={handleAddToCart}
          disabled={cartLoading || product.stock === 0}
          className="w-full py-3.5 rounded-xl text-[15px] font-bold transition-all tap-active disabled:opacity-50"
          style={{
            backgroundColor: branding.colors.primary,
            color: branding.colors.primaryText,
          }}
        >
          {cartLoading ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : `Add to Cart — ${formatPrice(product.price * quantity)}`}
        </button>
      </div>
    </div>
  );
}
