'use client';

import React from 'react';
import { useTelegram } from '@/providers/TelegramProvider';
import { branding } from '@/config/branding';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export default function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const { user } = useTelegram();
  const displayName = user?.first_name || 'Guest';

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Background with logo watermark */}
      <div className="relative flex-shrink-0 h-[35vh] bg-gradient-to-b from-gray-100 to-gray-50 overflow-hidden flex items-center justify-center">
        <div className="text-8xl font-bold text-gray-100 select-none opacity-60 tracking-wider">
          {branding.storeName}
        </div>
      </div>

      {/* Content card */}
      <div className="flex-1 bg-white rounded-t-[28px] -mt-8 relative z-10 px-6 pt-8 pb-6 flex flex-col">
        {/* Logo */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold" style={{ color: branding.colors.text }}>
            {branding.storeName.split('').map((char, i) => (
              <span key={i} style={char.toLowerCase() === 'o' && i === 3 ? { color: branding.colors.primary } : {}}>
                {char}
              </span>
            ))}
          </h1>
        </div>

        {/* Welcome text */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2" style={{ color: branding.colors.text }}>
            {branding.welcomeTitle}, {displayName} {branding.welcomeEmoji}
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: branding.colors.textSecondary }}>
            {branding.welcomeSubtitle}
          </p>
        </div>

        {/* User card */}
        <div className="bg-white border rounded-2xl p-4 mb-6 flex items-center gap-3"
          style={{ borderColor: branding.colors.border }}>
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
            style={{ backgroundColor: branding.colors.accent }}>
            {user?.photo_url ? (
              <img src={user.photo_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </div>
          
          {/* User info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[15px] truncate" style={{ color: branding.colors.text }}>
              {displayName}
            </p>
            {user?.username && (
              <p className="text-sm truncate" style={{ color: branding.colors.textSecondary }}>
                @{user.username}
              </p>
            )}
          </div>

          {/* Verified icon */}
          <div className="flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill={branding.colors.success} opacity="0.15" />
              <path d="M8 12l3 3 5-5" stroke={branding.colors.success} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Continue button */}
        <button
          onClick={onContinue}
          className="w-full py-4 rounded-xl text-[15px] font-bold tracking-wide tap-active transition-all duration-200 hover:shadow-lg active:scale-[0.98]"
          style={{
            backgroundColor: branding.colors.primary,
            color: branding.colors.primaryText,
          }}
        >
          {branding.welcomeButton}
        </button>

        {/* Privacy note */}
        <p className="text-center text-xs mt-4 leading-relaxed" style={{ color: branding.colors.textMuted }}>
          {branding.welcomeDisclaimer}
        </p>

        {/* Bot username */}
        <p className="text-center text-xs mt-4" style={{ color: branding.colors.textMuted }}>
          {branding.botUsername}
        </p>
      </div>
    </div>
  );
}
