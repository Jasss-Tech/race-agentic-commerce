'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onDismiss: () => void;
  variant?: 'success' | 'error' | 'info';
  duration?: number;
}

export function Toast({ message, onDismiss, variant = 'success', duration = 3500 }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!message) return;
    setIsExiting(false);
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onDismiss, 250);
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
  };

  const bgColors = {
    success: 'bg-emerald-950/90 border-emerald-500/40',
    error: 'bg-red-950/90 border-red-500/40',
    info: 'bg-indigo-950/90 border-indigo-500/40'
  };

  return (
    <div className="fixed top-20 right-4 z-[60] max-w-sm">
      <div
        className={`${isExiting ? 'toast-exit' : 'toast-enter'} ${bgColors[variant]} backdrop-blur-xl border rounded-xl px-4 py-3 flex items-center space-x-2.5 shadow-2xl`}
      >
        {icons[variant]}
        <span className="text-xs font-semibold text-slate-200 flex-1">{message}</span>
        <button
          onClick={() => { setIsExiting(true); setTimeout(onDismiss, 250); }}
          className="p-0.5 text-slate-500 hover:text-white transition-colors flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
