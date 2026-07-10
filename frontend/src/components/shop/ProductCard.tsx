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
      className="bg-white rounded-[24px] overflow-hidden transition-all duration-200 border border-[#EBEBEB]"
      style={{
        boxShadow: '0 2px 12px rgba(0,0,0,0.02)',
      }}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
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
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center transition-all tap-active shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
          >
            <svg width="15" height="15" viewBox="0 0 24 24"
              fill={isWishlisted ? branding.colors.error : 'none'}
              stroke={isWishlisted ? branding.colors.error : '#1A1A1A'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>
        )}

        {/* Discount badge */}
        {product.comparePrice && product.comparePrice > product.price && (
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: branding.colors.error }}>
            -{Math.round((1 - product.price / product.comparePrice) * 100)}%
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4" onClick={onSelect}>
        {/* Product name */}
        <h3 className="text-[14px] font-semibold text-gray-900 leading-tight mb-2.5 line-clamp-2 h-[38px]">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mb-3 flex items-baseline gap-1">
          <span className="text-[12px] text-[#6B7280] font-normal">
            {branding.productCard.pricePrefix}
          </span>
          <span className="text-[16px] font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-[11px] line-through ml-1.5 text-gray-400">
              {formatPrice(product.comparePrice)}
            </span>
          )}
        </div>

        {/* Select options button */}
        <button
          className="w-full py-2.5 rounded-full text-[13px] font-bold transition-all tap-active mt-1.5"
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
