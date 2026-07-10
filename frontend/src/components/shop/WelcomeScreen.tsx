'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useTelegram } from '@/providers/TelegramProvider';
import { hapticFeedback } from '@/lib/telegram';

/* ---------- Bekollo wordmark with smiley-sun "o" ---------- */
function BekolloLogo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-0" style={{ fontSize: size }}>
      <span className="font-extrabold tracking-tight text-black leading-none">
        Bek
      </span>
      <SmileySun size={size * 1.05} />
      <span className="font-extrabold tracking-tight text-black leading-none">
        llo
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
  const { user, isReady } = useTelegram();

  const displayName = user?.first_name || 'Guest';
  const username = user?.username ? `@${user.username}` : '';
  const initial = displayName.charAt(0).toUpperCase();

  const handleContinue = () => {
    hapticFeedback('notification');
    onContinue();
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#1a1a1a]">
      {/* Faded backdrop logo */}
      <div className="pointer-events-none absolute inset-x-0 top-[18%] flex justify-center opacity-30">
        <div className="scale-[2.2] grayscale">
          <BekolloLogo size={40} />
        </div>
      </div>

      {/* Bottom sheet */}
      <div className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-[#F9F9FB] px-6 pb-8 pt-3 shadow-[0_-8px_40px_rgba(0,0,0,0.25)]">
        {/* Drag handle */}
        <div className="mx-auto mb-6 h-1.5 w-10 rounded-full bg-black/15" />

        {/* Logo */}
        <div className="mb-5 flex justify-center">
          <BekolloLogo size={30} />
        </div>

        {/* Greeting */}
        <h1 className="text-center text-[22px] font-bold text-black">
          Welcome, {displayName} <span className="ml-1">🤩</span>
        </h1>
        <p className="mx-auto mt-2 max-w-[300px] text-center text-[14px] leading-relaxed text-neutral-500">
          Continue with your Telegram account to shop, save items, and track your orders.
        </p>

        {/* User card */}
        {isReady && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-[#EBEBEB]">
            {user?.photo_url ? (
              <img
                src={user.photo_url}
                alt={displayName}
                className="h-11 w-11 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 text-white font-semibold">
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
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleContinue}
          className="mt-5 flex h-[54px] w-full items-center justify-center rounded-full bg-[#FFD02B] text-[15px] font-bold uppercase tracking-wide text-black transition active:scale-[0.98] tap-active"
        >
          Continue with Telegram
        </button>

        <p className="mx-auto mt-4 max-w-[300px] text-center text-[12px] leading-relaxed text-neutral-400">
          We only use your Telegram name and photo to personalize your experience.
        </p>
      </div>
    </div>
  );
}
