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
    <div className="relative min-h-screen w-full overflow-hidden bg-[#1A1A1A]">
      {/* Futuristic ambient glow effects */}
      <div className="absolute top-[5%] left-[-15%] w-[320px] h-[320px] rounded-full bg-[#FFD02B]/10 blur-[120px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute top-[25%] right-[-15%] w-[300px] h-[300px] rounded-full bg-[#007AFF]/10 blur-[100px] pointer-events-none animate-pulse duration-[10000ms]" />

      {/* Main backdrop watermark logo - clearly visible on dark background */}
      <div className="pointer-events-none absolute inset-x-0 top-[18%] flex flex-col items-center justify-center opacity-[0.25] select-none scale-[1.3] sm:scale-[1.6] duration-700">
        <SummitetLogo light={true} size={42} />
      </div>

      {/* Pop-up bottom sheet with smooth slide-up animation */}
      <div className="fixed inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto no-scrollbar rounded-t-[32px] bg-[#F9F9FB] px-6 pb-10 pt-4 shadow-[0_-12px_45px_rgba(0,0,0,0.3)] border-t border-white/50 animate-slide-up z-20 flex flex-col justify-between">
        
        <div>
          {/* Drag handle */}
          <div className="mx-auto mb-6 h-1 w-14 rounded-full bg-neutral-300/80 shrink-0" />

          {/* Logo inside sheet */}
          <div className="mb-6 flex justify-center shrink-0">
            <SummitetLogo size={28} />
          </div>

          {/* Greeting */}
          <div className="text-center flex flex-col gap-3.5 mb-6">
            <h1 className="text-[23px] sm:text-[25px] font-extrabold text-black tracking-tight leading-tight flex items-center justify-center gap-1.5 animate-fade-in">
              Welcome, {displayName} <span className="text-[23px] animate-bounce">🌞</span>
            </h1>
            
            {/* Subtitle */}
            <p className="mx-auto max-w-[310px] text-[14px] leading-relaxed text-neutral-500 font-medium">
              Continue with your Telegram account to shop, save items, and track your orders.
            </p>
          </div>

          {/* User card wrapper */}
          <div className="mb-6 flex items-center gap-3.5 rounded-2xl bg-white p-3.5 shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-[#EBEBEB] hover:border-neutral-200 transition-all duration-300">
            {user?.photo_url ? (
              <img
                src={user.photo_url}
                alt={displayName}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-neutral-50"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#5E5CE6] to-[#007AFF] text-white font-bold text-lg shadow-sm">
                {initial}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold text-black tracking-tight">
                {displayName}
              </p>
              {username && (
                <p className="truncate text-[13px] text-neutral-400 font-medium mt-0.5">
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
        </div>

        {/* CTA Button Wrapper */}
        <div className="flex flex-col gap-5 mt-auto">
          <button
            onClick={handleContinue}
            disabled={loading}
            className="flex h-[56px] w-full items-center justify-center rounded-full bg-[#FFD02B] text-[15px] font-extrabold uppercase tracking-wider text-black shadow-[0_4px_20px_rgba(255,208,43,0.22)] active:scale-[0.98] transition-all duration-300 tap-active disabled:opacity-60 shrink-0"
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
          <p className="mx-auto max-w-[280px] text-center text-[12px] leading-relaxed text-neutral-400 font-medium shrink-0">
            We only use your Telegram name and photo to personalize your experience.
          </p>
        </div>
      </div>
    </div>
  );
}
