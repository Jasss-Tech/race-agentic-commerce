'use client';

import React from 'react';
import Link from 'next/link';
import { 
  X, 
  Bell, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Sparkles,
  ArrowRight,
  Package
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'notif-1',
      title: 'Inventory Sentinel Depletion Risk',
      message: 'TechNova Mechanical Keyboard Pro stock is at 20 units. Safety stock reorder proposed.',
      time: '4 mins ago',
      type: 'warning',
      href: '/merchant/intelligence',
      icon: Package
    },
    {
      id: 'notif-2',
      title: 'Price Drift Attempt Blocked',
      message: 'Policy engine strictly blocked client purchase attempt where price deviated by 27%.',
      time: '28 mins ago',
      type: 'security',
      href: '/demo',
      icon: ShieldCheck
    },
    {
      id: 'notif-3',
      title: 'AI Cross-Sell Opportunity Ready',
      message: 'Growth agent discovered 28% attach rate for Keyboard ➔ Wrist Rest bundle. +₹2.4L lift.',
      time: '1 hour ago',
      type: 'growth',
      href: '/merchant/growth',
      icon: TrendingUp
    },
    {
      id: 'notif-4',
      title: 'Razorpay Delegated Payment Completed',
      message: 'Customer Aarav Sharma completed purchase ₹2,199. SHA-256 proof sealed.',
      time: '2 hours ago',
      type: 'success',
      href: '/proofs',
      icon: CheckCircle2
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-surface border-l border-white/10 shadow-2xl flex flex-col justify-between animate-slideLeft text-slate-100">
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Live Intelligence Stream</h2>
                <p className="text-[11px] text-slate-400 font-mono">4 Unread Critical Alerts</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.map((n) => {
              const Icon = n.icon;
              return (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={onClose}
                  className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/5 hover:border-indigo-500/40 transition-all flex items-start space-x-3 block group"
                >
                  <div className={`p-2 rounded-lg mt-0.5 ${
                    n.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                    n.type === 'security' ? 'bg-red-500/20 text-red-400' :
                    n.type === 'growth' ? 'bg-cyan-500/20 text-cyan-400' :
                    'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white group-hover:text-indigo-200 truncate">{n.title}</h4>
                      <span className="text-[9px] font-mono text-slate-500">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">{n.message}</p>
                    <div className="text-[10px] font-semibold text-indigo-400 flex items-center space-x-1 mt-2">
                      <span>Take Action</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-slate-950/60 text-center">
            <Link 
              href="/audit" 
              onClick={onClose}
              className="text-xs font-mono text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              View Full Cryptographic Audit Log ➔
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
