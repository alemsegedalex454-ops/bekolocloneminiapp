'use client';

import React from 'react';

export function SummitetLogo({ className = "", size }: { className?: string; size?: number }) {
  const sizeStyle = size ? { fontSize: size } : {};
  return (
    <div className={`flex items-center ${className}`} style={sizeStyle}>
      <span className="text-[26px] font-extrabold tracking-tight text-black leading-none">Summ</span>
      <SmileySun className="mx-[1px] h-[26px] w-[26px]" size={size} />
      <span className="text-[26px] font-extrabold tracking-tight text-black leading-none">tet</span>
    </div>
  );
}

// Keep alias to avoid immediate breaking
export { SummitetLogo as BekolloLogo };

function SmileySun({ className = "", size }: { className?: string; size?: number }) {
  const dimensions = size ? { width: size * 0.85, height: size * 0.85 } : {};
  return (
    <svg 
      viewBox="0 0 40 40" 
      className={className} 
      style={dimensions}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* rays */}
      <g stroke="#FFD02B" strokeWidth="2.2" strokeLinecap="round">
        <line x1="20" y1="2"  x2="20" y2="6" />
        <line x1="9"  y1="6"  x2="11" y2="9" />
        <line x1="31" y1="6"  x2="29" y2="9" />
        <line x1="3"  y1="15" x2="6"  y2="16" />
        <line x1="37" y1="15" x2="34" y2="16" />
      </g>
      {/* face */}
      <circle cx="20" cy="22" r="11" fill="#FFD02B" />
      <circle cx="16.5" cy="21" r="1.4" fill="#111" />
      <circle cx="23.5" cy="21" r="1.4" fill="#111" />
      <path d="M15.5 25 Q20 29 24.5 25" stroke="#111" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}
