'use client';

import React, { useState, useEffect } from 'react';
import { branding } from '@/config/branding';
import { useTelegram } from '@/providers/TelegramProvider';
import api from '@/lib/api';
import type { User } from '@/types';
import type { Screen } from './ShopApp';

interface AccountPageProps {
  navigate: (screen: Screen) => void;
  goBack: () => void;
}

export default function AccountPage({ navigate, goBack }: AccountPageProps) {
  const { user: tgUser } = useTelegram();
  const [userData, setUserData] = useState<User | null>(null);

  useEffect(() => {
    api.get('/users/me').then(({ data }) => {
      setUserData(data.user);
    }).catch(() => {});
  }, []);

  const menuItems = [
    {
      icon: '📦',
      label: 'Order History',
      subtitle: `${userData?._count?.orders || 0} orders`,
      action: () => navigate({ name: 'orders' }),
    },
    {
      icon: '❤️',
      label: 'Wishlist',
      subtitle: `${userData?._count?.wishlist || 0} items`,
      action: () => {},
    },
    {
      icon: '📍',
      label: 'Saved Addresses',
      subtitle: `${userData?._count?.addresses || 0} addresses`,
      action: () => {},
    },
    {
      icon: '🕐',
      label: 'Recently Viewed',
      subtitle: 'Your browsing history',
      action: () => {},
    },
  ];

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
        <h2 className="text-lg font-bold" style={{ color: branding.colors.text }}>My Account</h2>
      </div>

      {/* Profile Card */}
      <div className="px-4 py-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
            style={{ backgroundColor: branding.colors.accent }}>
            {tgUser?.photo_url ? (
              <img src={tgUser.photo_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              (tgUser?.first_name || 'U').charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: branding.colors.text }}>
              {tgUser?.first_name} {tgUser?.last_name || ''}
            </h3>
            {tgUser?.username && (
              <p className="text-sm" style={{ color: branding.colors.textSecondary }}>
                @{tgUser.username}
              </p>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all tap-active"
              style={{ backgroundColor: 'transparent' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = branding.colors.surface)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold" style={{ color: branding.colors.text }}>{item.label}</p>
                <p className="text-xs" style={{ color: branding.colors.textSecondary }}>{item.subtitle}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={branding.colors.textMuted} strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
