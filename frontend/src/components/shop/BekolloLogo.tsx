'use client';

import React from 'react';

export function SummitIcon({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg 
      viewBox="0 0 40 40" 
      className={className} 
      style={style}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left peak slope */}
      <path 
        d="M8 28L20 8L32 28" 
        stroke="url(#summitGradient)" 
        strokeWidth="3.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Inner nested peak */}
      <path 
        d="M14 28L20 18L26 28" 
        stroke="#1A1A1A" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Peak glow dot / star */}
      <circle cx="20" cy="5" r="2.5" fill="#FFD02B" />
      <defs>
        <linearGradient id="summitGradient" x1="8" y1="8" x2="32" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD02B" />
          <stop stopColor="#FF9500" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function SummitetLogo({ className = "", size }: { className?: string; size?: number }) {
  const sizeStyle = size ? { fontSize: size } : {};
  const iconSizeClass = size ? `h-[${size * 0.9}px] w-[${size * 0.9}px]` : "h-7 w-7";
  
  return (
    <div className={`flex items-center gap-2 ${className}`} style={sizeStyle}>
      <SummitIcon className={iconSizeClass} />
      <span className="font-extrabold tracking-tight text-black leading-none" style={size ? { fontSize: size } : { fontSize: '24px' }}>
        Summitet
      </span>
    </div>
  );
}

// Keep alias to avoid immediate breaking
export { SummitetLogo as BekolloLogo };
