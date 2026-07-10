'use client';

import React, { useState } from 'react';
import { useTelegram } from '@/providers/TelegramProvider';
import { hapticFeedback } from '@/lib/telegram';
import api from '@/lib/api';
import { SummitIcon } from './BekolloLogo';

/* ---------- Summitet wordmark with peak icon ---------- */
function SummitetLogo({ size = 32 }: { size?: number }) {
  const sizeStyle = size ? { fontSize: size } : {};
  const iconSize = size ? size * 0.9 : 28;
  return (
    <div className="flex items-center gap-2" style={sizeStyle}>
      <SummitIcon style={{ width: iconSize, height: iconSize }} />
      <span className="font-extrabold tracking-tight text-black leading-none" style={size ? { fontSize: size } : {}}>
        Summitet
      </span>
    </div>
  );
}

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
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#FAFAFC] to-[#F1F1F5] flex flex-col justify-end">
      {/* Futuristic floating background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] rounded-full bg-[#FFD02B]/15 blur-[100px] pointer-events-none animate-pulse duration-[6000ms]" />
      <div className="absolute top-[30%] right-[-10%] w-[250px] h-[250px] rounded-full bg-[#007AFF]/10 blur-[80px] pointer-events-none animate-pulse duration-[8000ms]" />

      {/* Faded backdrop watermark logo */}
      <div className="pointer-events-none absolute inset-x-0 top-[20%] flex justify-center opacity-[0.05] select-none scale-[1.3] sm:scale-[1.6] duration-700">
        <div className="scale-[2.4]">
          <SummitetLogo size={40} />
        </div>
      </div>

      {/* Bottom sheet */}
      <div className="relative w-full max-h-[90vh] overflow-y-auto no-scrollbar rounded-t-[32px] bg-white/90 backdrop-blur-xl px-6 pb-8 pt-4 shadow-[0_-12px_40px_rgba(0,0,0,0.04)] border-t border-white/40 animate-slide-up z-20 flex flex-col gap-6">
        {/* Drag handle */}
        <div className="mx-auto h-1.5 w-12 rounded-full bg-neutral-300/80 shrink-0" />

        {/* Logo */}
        <div className="flex justify-center shrink-0">
          <SummitetLogo size={28} />
        </div>

        {/* Greeting & Subtitle Wrapper */}
        <div className="text-center flex flex-col gap-3">
          <h1 className="text-[24px] sm:text-[26px] font-extrabold text-black tracking-tight leading-tight flex items-center justify-center gap-1.5 animate-fade-in">
            Welcome, {displayName} <span className="text-[24px] animate-bounce">🌞</span>
          </h1>
          <p className="mx-auto max-w-[320px] text-[14px] leading-relaxed text-neutral-500/90 font-medium">
            Continue with your Telegram account to shop, save items, and track your orders.
          </p>
        </div>

        {/* User card */}
        <div className="flex items-center gap-3.5 rounded-2xl bg-white/95 p-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-neutral-100 hover:border-neutral-200/80 transition-all duration-300">
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
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-500/80 text-emerald-500 bg-emerald-50/50 shrink-0">
            <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* CTA Button Wrapper */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handleContinue}
            disabled={loading}
            className="flex h-[56px] w-full items-center justify-center rounded-full bg-[#FFD02B] text-[15px] font-extrabold uppercase tracking-wider text-black shadow-[0_4px_20px_rgba(255,208,43,0.25)] hover:shadow-[0_6px_24px_rgba(255,208,43,0.35)] transition-all duration-300 active:scale-[0.97] tap-active disabled:opacity-60"
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
          <p className="mx-auto max-w-[280px] text-center text-[12px] leading-relaxed text-neutral-400 font-medium">
            We only use your Telegram name and photo to personalize your experience.
          </p>
        </div>
      </div>
    </div>
  );
}
