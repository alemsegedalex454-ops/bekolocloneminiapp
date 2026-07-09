'use client';

import React, { useState, useEffect } from 'react';
import { branding } from '@/config/branding';
import { formatPrice } from '@/lib/telegram';
import api from '@/lib/api';
import type { Order } from '@/types';
import type { Screen } from './ShopApp';

interface OrdersPageProps {
  navigate: (screen: Screen) => void;
  goBack: () => void;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: '#F59E0B', bg: '#FEF3C7' },
  confirmed: { label: 'Confirmed', color: '#3B82F6', bg: '#DBEAFE' },
  processing: { label: 'Processing', color: '#8B5CF6', bg: '#EDE9FE' },
  shipped: { label: 'Shipped', color: '#06B6D4', bg: '#CFFAFE' },
  delivered: { label: 'Delivered', color: '#22C55E', bg: '#DCFCE7' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: '#FEE2E2' },
};

export default function OrdersPage({ navigate, goBack }: OrdersPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    api.get('/orders', { params: { status: filter } })
      .then(({ data }) => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  const tabs = ['all', 'pending', 'processing', 'shipped', 'delivered'];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b px-4 py-3 flex items-center gap-3"
        style={{ borderColor: branding.colors.border }}>
        <button onClick={goBack} className="tap-active p-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={branding.colors.text} strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-bold" style={{ color: branding.colors.text }}>My Orders</h2>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-3 border-b" style={{ borderColor: branding.colors.border }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className="px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all tap-active capitalize"
            style={{
              backgroundColor: filter === tab ? branding.colors.secondary : 'transparent',
              color: filter === tab ? '#FFFFFF' : branding.colors.textSecondary,
              border: `1px solid ${filter === tab ? branding.colors.secondary : branding.colors.border}`,
            }}
          >
            {tab === 'all' ? 'All Orders' : tab}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border p-4" style={{ borderColor: branding.colors.border }}>
                <div className="h-4 skeleton w-1/3 mb-2" />
                <div className="h-3 skeleton w-1/2 mb-3" />
                <div className="h-10 skeleton w-full rounded-lg" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg mb-1" style={{ color: branding.colors.textSecondary }}>No orders found</p>
            <p className="text-sm" style={{ color: branding.colors.textMuted }}>Your orders will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              return (
                <div key={order.id} className="rounded-xl border p-4 animate-fade-in tap-active"
                  style={{ borderColor: branding.colors.border }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-semibold" style={{ color: branding.colors.textSecondary }}>
                      {order.orderNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    {order.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                        {item.productImage && (
                          <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <span className="text-xs" style={{ color: branding.colors.textMuted }}>
                        +{order.items.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: branding.colors.textSecondary }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-sm font-bold">{formatPrice(order.total)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
