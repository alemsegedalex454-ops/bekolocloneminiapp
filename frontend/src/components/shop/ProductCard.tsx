'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import type { Product } from '@/types';
import { formatPrice, hapticFeedback } from '@/lib/telegram';
import { branding } from '@/config/branding';

interface ProductCardProps {
  product: Product;
  isWishlisted?: boolean;
  onSelect: () => void;
  onToggleWishlist?: () => void;
}

export default function ProductCard({ product, isWishlisted = false, onSelect, onToggleWishlist }: ProductCardProps) {
  const imageUrl = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0]
    : '/placeholder.png';

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleWishlist) {
      hapticFeedback('selection');
      onToggleWishlist();
    }
  };

  return (
    <div
      onClick={() => {
        hapticFeedback('impact');
        onSelect();
      }}
      className="group flex flex-col overflow-hidden rounded-[24px] bg-white border border-[#EBEBEB] transition-shadow hover:shadow-[0_2px_4px_rgba(16,24,40,0.02),0_8px_24px_rgba(16,24,40,0.04)] cursor-pointer"
    >
      {/* Image — 3:4 portrait */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F5F7]">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        )}

        {/* Wishlist circle */}
        {onToggleWishlist && (
          <button
            type="button"
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            onClick={handleWishlist}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white transition-transform active:scale-95 shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
          >
            <Heart
              size={17}
              strokeWidth={2.2}
              className={
                isWishlisted
                  ? 'fill-[#EF4444] text-[#EF4444]'
                  : 'text-[#1A1A1A]'
              }
            />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <h3 className="line-clamp-2 text-[14px] font-semibold leading-snug text-[#1A1A1A] h-[38px]">
          {product.name}
        </h3>

        <div className="flex items-baseline gap-1.5">
          <span className="text-[12px] text-[#6B7280]">
            {branding.productCard.pricePrefix}
          </span>
          <span className="text-[15px] font-bold text-[#1A1A1A]">
            {formatPrice(product.price)}
          </span>
        </div>

        <span
          className="mt-1.5 inline-flex h-10 w-full items-center justify-center rounded-full bg-[#FFD02B] text-[13px] font-bold text-[#1A1A1A] transition-colors group-hover:bg-[#E5BA20]"
        >
          {branding.productCard.buttonText}
        </span>
      </div>
    </div>
  );
}
