'use client';

import dynamic from 'next/dynamic';

const ShopApp = dynamic(() => import('@/components/shop/ShopApp'), { ssr: false });

export default function Home() {
  return <ShopApp />;
}
