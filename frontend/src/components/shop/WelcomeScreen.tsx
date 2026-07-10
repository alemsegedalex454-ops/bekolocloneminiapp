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

      {/* Main backdrop watermark logo - elegant white text on dark backdrop */}
      <div className="pointer-events-none absolute inset-x-0 top-[18%] flex flex-col items-center justify-center select-none scale-[1.3] sm:scale-[1.6] duration-700 animate-logo-watermark">
        <SummitetLogo light={true} size={42} />
      </div>

      {/* Pop-up bottom sheet with smooth slide-up animation and flex gaps for perfect mobile spacing */}
      <div className="fixed inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto no-scrollbar rounded-t-[30px] bg-white px-6 pb-10 pt-4 shadow-[0_-10px_45px_rgba(0,0,0,0.35)] border-t border-white/10 animate-slide-up z-20 flex flex-col gap-6">
        
        {/* Drag handle */}
        <div className="mx-auto h-1.5 w-12 rounded-full bg-neutral-200 shrink-0" />

        {/* Logo inside sheet */}
        <div className="flex justify-center shrink-0">
          <SummitetLogo size={28} />
        </div>

        {/* Greeting & Subtitle Container with vertical spacing */}
        <div className="text-center flex flex-col gap-3">
          <h1 className="text-[22px] font-bold text-black flex items-center justify-center gap-1.5">
            Welcome, <span className="text-[#132F33] font-extrabold">{displayName}</span> <span className="text-[22px] animate-bounce">🌞</span>
          </h1>
          <p className="mx-auto max-w-[300px] text-[14px] leading-relaxed text-neutral-500 font-medium">
            Continue with your Telegram account to shop, save items, and track your orders.
          </p>
        </div>

        {/* User card wrapper with flex stacking to prevent name overlap */}
        <div className="flex items-center gap-3.5 rounded-2xl bg-[#F9F9FB] p-4 border border-[#EBEBEB] shrink-0">
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
          <div className="min-w-0 flex-1 flex flex-col gap-0.5">
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
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-500 text-emerald-500 bg-emerald-50/50 shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* CTA Button & Bottom Disclaimer container */}
        <div className="flex flex-col gap-5 shrink-0 mt-2">
          <button
            onClick={handleContinue}
            disabled={loading}
            className="flex h-[54px] w-full items-center justify-center rounded-full bg-[#FFD02B] text-[15px] font-extrabold uppercase tracking-wider text-black transition active:scale-[0.98] tap-active disabled:opacity-60 shrink-0"
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

          <p className="mx-auto max-w-[300px] text-center text-[12px] leading-relaxed text-neutral-400 font-medium">
            We only use your Telegram name and photo to personalize your experience.
          </p>
        </div>

      </div>
    </div>
  );
}
