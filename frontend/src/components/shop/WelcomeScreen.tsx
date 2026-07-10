'use client';

import React, { useState } from 'react';
import { useTelegram } from '@/providers/TelegramProvider';
import { hapticFeedback } from '@/lib/telegram';
import api from '@/lib/api';
import { SummitetLogo } from './BekolloLogo';

interface WelcomeScreenProps {
  onContinue: () => void;
}

export default function WelcomeScreen({ onContinue }: WelcomeScreenProps) {
  const { user } = useTelegram();

  const displayName = user?.first_name || 'Customer';
  const username = user?.username ? `@${user.username}` : '';
  const initial = displayName.charAt(0);

  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    hapticFeedback('notification');
    setLoading(true);
    try {
      await api.post('/users/auth');
    } catch (err) {
      console.warn('Failed to ensure backend user registration:', err);
    } finally {
      setLoading(false);
      onContinue();
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#132F33]">
      {/* Futuristic elegant ambient glow effects */}
      <div className="absolute top-[5%] left-[-15%] w-[320px] h-[320px] rounded-full bg-[#FFD02B]/6 blur-[120px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute top-[25%] right-[-15%] w-[300px] h-[300px] rounded-full bg-white/5 blur-[100px] pointer-events-none animate-pulse duration-[10000ms]" />

      {/* Main backdrop watermark logo - elegant yellow text on dark backdrop */}
      <div className="pointer-events-none absolute inset-x-0 top-[18%] flex flex-col items-center justify-center select-none scale-[1.3] sm:scale-[1.6] duration-700 animate-logo-watermark">
        <SummitetLogo yellow={true} size={42} />
      </div>

      {/* Pop-up bottom sheet with smooth slide-up animation and exact spacing layout */}
      <div className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-white px-6 pb-8 pt-3 shadow-[0_-8px_40px_rgba(0,0,0,0.25)] animate-slide-up z-20">
        
        {/* Drag handle */}
        <div className="mx-auto mb-6 h-1.5 w-10 rounded-full bg-black/15" />

        {/* Logo inside sheet */}
        <div className="mb-5 flex justify-center">
          <SummitetLogo size={30} />
        </div>

        {/* Greeting */}
        <h1 className="text-center text-[22px] font-bold text-black flex items-center justify-center gap-1.5">
          Welcome, <span className="text-[#132F33] font-extrabold">{displayName}</span> <span className="text-[22px] animate-bounce">🌞</span>
        </h1>
        
        {/* Subtitle */}
        <p className="mx-auto mt-2 max-w-[300px] text-center text-[14px] leading-relaxed text-neutral-500">
          Continue with your Telegram account to shop, save items, and track your orders.
        </p>

        {/* User card wrapper */}
        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#EBEBEB]">
          {user?.photo_url ? (
            <img
              src={user.photo_url}
              alt={displayName}
              className="h-11 w-11 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-[#5E5CE6] to-[#007AFF] text-white font-semibold text-lg shrink-0">
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-black leading-tight">
              {displayName}
            </p>
            {username && (
              <p className="truncate text-[13px] text-neutral-500 leading-tight">
                {username}
              </p>
            )}
          </div>
          {/* Emerald check verified bubble */}
          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500 text-emerald-500 bg-emerald-50/50 shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleContinue}
          disabled={loading}
          className="mt-5 flex h-[54px] w-full items-center justify-center rounded-full bg-[#FFD02B] text-[15px] font-extrabold uppercase tracking-wider text-black transition active:scale-[0.98] tap-active disabled:opacity-60"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Connecting…</span>
            </div>
          ) : (
            'Continue with Telegram'
          )}
        </button>

        {/* Bottom Disclaimer */}
        <p className="mx-auto mt-6 max-w-[300px] text-center text-[12px] leading-relaxed text-neutral-400 font-medium">
          We only use your Telegram name and photo to personalize your experience.
        </p>

      </div>
    </div>
  );
}
