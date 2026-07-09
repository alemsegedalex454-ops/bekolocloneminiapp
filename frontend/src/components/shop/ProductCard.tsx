'use client';

import React from 'react';
import { branding } from '@/config/branding';
import { formatPrice } from '@/lib/telegram';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
  onSelect: () => void;
  onToggleWishlist?: () => void;
}

export default function ProductCard({ product, isWishlisted, onSelect, onToggleWishlist }: ProductCardProps) {
  const imageUrl = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : '/placeholder.png';

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden transition-all duration-200 tap-active"
      style={{
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        border: `1px solid ${branding.colors.border}`,
      }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover product-image-hover"
          loading="lazy"
          onClick={onSelect}
        />

        {/* Wishlist button */}
        {onToggleWishlist && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWishlist(); }}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all tap-active shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24"
              fill={isWishlisted ? branding.colors.error : 'none'}
              stroke={isWishlisted ? branding.colors.error : '#999'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>
        )}

        {/* Discount badge */}
        {product.comparePrice && product.comparePrice > product.price && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: branding.colors.error }}>
            -{Math.round((1 - product.price / product.comparePrice) * 100)}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3" onClick={onSelect}>
        {/* Product name */}
        <h3 className="text-[13px] font-medium leading-tight mb-2 line-clamp-2"
          style={{ color: branding.colors.text }}>
          {product.name}
        </h3>

        {/* Price */}
        <div className="mb-3">
          <span className="text-[11px] mr-1" style={{ color: branding.colors.textSecondary }}>
            {branding.productCard.pricePrefix}
          </span>
          <span className="text-[15px] font-bold" style={{ color: branding.colors.text }}>
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-[11px] line-through ml-1.5" style={{ color: branding.colors.textMuted }}>
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Select options button */}
        <button
          className="w-full py-2 rounded-full text-[12px] font-semibold transition-all tap-active"
          style={{
            backgroundColor: branding.colors.primary,
            color: branding.colors.primaryText,
          }}
        >
          {branding.productCard.buttonText}
        </button>
      </div>
    </div>
  );
}
