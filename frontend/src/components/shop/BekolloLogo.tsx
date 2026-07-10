'use client';

import React from 'react';

export function SummitetLogo({ 
  className = "", 
  size = 28, 
  align = "center",
  light = false
}: { 
  className?: string; 
  size?: number; 
  align?: "left" | "center";
  light?: boolean;
}) {
  const isLeft = align === "left";
  const titleSize = size;
  const subtitleSize = Math.max(7, Math.floor(size * 0.32));
  
  return (
    <div className={`flex flex-col ${isLeft ? "items-start text-left" : "items-center text-center"} select-none ${className}`}>
      <span 
        className={`font-black tracking-widest leading-none ${light ? 'text-white' : 'text-black'}`}
        style={{ fontSize: titleSize, fontFamily: "'Inter', sans-serif" }}
      >
        SUMMITET
      </span>
      <span 
        className={`font-bold tracking-[0.28em] leading-none mt-1.5 ${light ? 'text-neutral-400/80' : 'text-neutral-400'}`}
        style={{ fontSize: subtitleSize, fontFamily: "'Inter', sans-serif" }}
      >
        GLORIOUS PEAK
      </span>
    </div>
  );
}

// Keep alias to avoid immediate breaking
export { SummitetLogo as BekolloLogo };
