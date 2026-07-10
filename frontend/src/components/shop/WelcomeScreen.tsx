'use client';

import React, { useState } from 'react';
import { useTelegram } from '@/providers/TelegramProvider';
import { hapticFeedback } from '@/lib/telegram';
import api from '@/lib/api';

/* ---------- Summitet wordmark with smiley-sun "i" ---------- */
function SummitetLogo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-0" style={{ fontSize: size }}>
      <span className="font-extrabold tracking-tight text-black leading-none">
        Summ
      </span>
      <SmileySun size={size * 1.05} />
      <span className="font-extrabold tracking-tight text-black leading-none">
        tet
      </span>
    </div>
  );
}

function SmileySun({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className="-mx-[1px] -mt-1"
    >
      {/* sun rays */}
      <g stroke="#FFD02B" strokeWidth="2.2" strokeLinecap="round">
        <line x1="20" y1="2" x2="20" y2="7" />
        <line x1="8"  y1="6"  x2="11" y2="10" />
        <line x1="32" y1="6"  x2="29" y2="10" />
        <line x1="3"  y1="16" x2="8"  y2="17" />
        <line x1="37" y1="16" x2="32" y2="17" />
      </g>
      {/* face */}
      <circle cx="20" cy="22" r="12" fill="#FFD02B" />
      <circle cx="16" cy="21" r="1.5" fill="#1a1a1a" />
      <circle cx="24" cy="21" r="1.5" fill="#1a1a1a" />
      <path
        d="M15 25.5 Q20 29 25 25.5"
        stroke="#1a1a1a"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
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
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Faded backdrop watermark logo */}
      <div className="pointer-events-none absolute inset-x-0 top-[22%] flex justify-center opacity-[0.06] select-none">
        <div className="scale-[2.4]">
          <SummitetLogo size={40} />
        </div>
      </div>

      {/* Bottom sheet */}
      <div className="fixed inset-x-0 bottom-0 rounded-t-[28px] bg-[#F9F9FB] px-6 pb-8 pt-3 shadow-[0_-8px_40px_rgba(0,0,0,0.06)] border-t border-neutral-100 animate-slide-up z-20">
        {/* Drag handle */}
        <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-neutral-300" />

        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <SummitetLogo size={30} />
        </div>

        {/* Greeting */}
        <h1 className="text-center text-[22px] font-bold text-black flex items-center justify-center gap-1">
          Welcome, {displayName} <span className="text-[22px]">🌞</span>
        </h1>
        
        {/* Subtitle */}
        <p className="mx-auto mt-4 max-w-[300px] text-center text-[14px] leading-relaxed text-neutral-500">
          Continue with your Telegram account to shop, save items, and track your orders.
        </p>

        {/* User card */}
        <div className="mt-8 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#EBEBEB]">
          {user?.photo_url ? (
            <img
              src={user.photo_url}
              alt={displayName}
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-[#5E5CE6] to-[#007AFF] text-white font-semibold text-lg">
              {initial}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-black">
              {displayName}
            </p>
            {username && (
              <p className="truncate text-[13px] text-neutral-500">
                {username}
              </p>
            )}
          </div>
          <div className="flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500 text-emerald-500 bg-emerald-50/50">
            <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={handleContinue}
          disabled={loading}
          className="mt-8 flex h-[54px] w-full items-center justify-center rounded-full bg-[#FFD02B] text-[15px] font-extrabold uppercase tracking-wider text-black transition active:scale-[0.98] tap-active disabled:opacity-60"
        >
          {loading ? 'Connecting…' : 'Continue with Telegram'}
        </button>

        {/* Bottom Disclaimer */}
        <p className="mx-auto mt-6 max-w-[300px] text-center text-[12px] leading-relaxed text-neutral-400">
          We only use your Telegram name and photo to personalize your experience.
        </p>
      </div>
    </div>
  );
}
