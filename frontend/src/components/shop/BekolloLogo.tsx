'use client';

import React from 'react';

export function BekolloLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <span className="text-[26px] font-extrabold tracking-tight text-black leading-none">Bek</span>
      <SmileySun className="mx-[1px] h-[26px] w-[26px]" />
      <span className="text-[26px] font-extrabold tracking-tight text-black leading-none">llo</span>
    </div>
  );
}

function SmileySun({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
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
