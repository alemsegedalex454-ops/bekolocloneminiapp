'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import type { Product } from '@/types';
import { hapticFeedback, formatPrice } from '@/lib/telegram';
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

  const toggleWishlist = async (e: React.MouseEvent) => {
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
      className="flex flex-col overflow-hidden rounded-[20px] bg-white cursor-pointer hover:shadow-sm transition-shadow"
    >
      {/* Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f2f2f2]">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
        {onToggleWishlist && (
          <button
            onClick={toggleWishlist}
            aria-label="Toggle wishlist"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm active:scale-95 transition-transform"
          >
            <Heart
              className={`h-[18px] w-[18px] ${isWishlisted ? 'fill-black text-black' : 'text-black'}`}
              strokeWidth={1.8}
            />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-4 pt-3 pb-4">
        <h3 className="text-[15px] font-medium leading-snug text-black line-clamp-2 min-h-[40px]">
          {product.name}
        </h3>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-[13px] text-neutral-400">
            {branding.productCard.pricePrefix}
          </span>
          <span className="text-[17px] font-bold text-black">
            {formatPrice(product.price)}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            hapticFeedback('impact');
            onSelect();
          }}
          className="mt-3 h-11 w-full rounded-full bg-[#FFD02B] text-[14px] font-bold text-black active:scale-[0.98] transition-transform"
        >
          {branding.productCard.buttonText}
        </button>
      </div>
    </div>
  );
}
