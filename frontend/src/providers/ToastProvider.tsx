'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { branding } from '@/config/branding';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-[90vw]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-slide-in rounded-xl px-4 py-3 shadow-lg text-sm font-medium flex items-center gap-2"
            style={{
              backgroundColor:
                toast.type === 'success' ? branding.colors.success :
                toast.type === 'error' ? branding.colors.error :
                toast.type === 'warning' ? branding.colors.warning :
                branding.colors.info,
              color: '#FFFFFF',
            }}
            onClick={() => removeToast(toast.id)}
          >
            <span>
              {toast.type === 'success' ? '✓' :
               toast.type === 'error' ? '✕' :
               toast.type === 'warning' ? '⚠' : 'ℹ'}
            </span>
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
