'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldCheck, 
  Bot, 
  Store, 
  TrendingUp, 
  FileCheck2, 
  Activity, 
  Sparkles,
  Lock,
  Layers
} from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/buyer', label: 'Buyer Agent', icon: Bot },
    { href: '/merchant', label: 'Merchant Studio', icon: Store },
    { href: '/merchant/growth', label: 'Growth Agent', icon: TrendingUp },
    { href: '/merchant/passport', label: 'Agent Passport', icon: ShieldCheck },
    { href: '/trust', label: 'Trust Center', icon: Lock },
    { href: '/audit', label: 'Audit Explorer', icon: Activity },
    { href: '/proofs', label: 'Proof Engine', icon: FileCheck2 },
    { href: '/demo', label: 'Live Demo Suite', icon: Sparkles, badge: '5 Demos', highlight: true }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-brand-razorblue to-brand-accent flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-lg tracking-wider text-white">RACE</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                    RZP-ACP v1.0
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium tracking-tight -mt-0.5">
                  Razorpay Agentic Commerce Exchange
                </span>
              </div>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href) && link.href !== '/merchant');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    link.highlight
                      ? 'bg-gradient-to-r from-indigo-600/30 to-brand-accent/30 text-indigo-200 border border-indigo-500/40 hover:border-indigo-400'
                      : isActive
                      ? 'bg-white/10 text-white shadow-sm border border-white/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-indigo-500 text-white font-bold animate-pulse">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Razorpay Test Mode Indicator */}
          <div className="flex items-center space-x-2.5">
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-mono text-[11px]">Razorpay Test Mode</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
