'use client';

import React from 'react';

export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
      <div className="aspect-square skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-4 skeleton w-3/4" />
        <div className="h-3 skeleton w-1/3" />
        <div className="h-5 skeleton w-1/2" />
        <div className="h-8 skeleton w-full rounded-full" />
      </div>
    </div>
  );
}
