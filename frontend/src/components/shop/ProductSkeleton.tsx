'use client';

import React from 'react';

export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-[24px] overflow-hidden border border-[#EBEBEB]">
      <div className="aspect-[3/4] skeleton" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 skeleton w-3/4" />
        <div className="h-3 skeleton w-1/3" />
        <div className="h-5 skeleton w-1/2" />
        <div className="h-10 skeleton w-full rounded-full" />
      </div>
    </div>
  );
}
