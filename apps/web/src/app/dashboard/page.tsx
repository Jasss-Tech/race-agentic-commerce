'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Store, ShieldCheck, Cpu, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          RACE <span className="text-gradient">Control Plane</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Razorpay Agentic Commerce Exchange — Bounded autonomy control plane for AI buyer agents and autonomous merchants.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/buyer" className="p-6 glass-panel rounded-2xl space-y-4 hover:border-indigo-500/50 transition duration-300 group">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 group-hover:scale-110 transition">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Buyer Agent</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Conversational search, product comparison, mandate bounds, and one-click delegated checkout.
          </p>
          <div className="flex items-center text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition">
            Launch Agent <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>

        <Link href="/merchant" className="p-6 glass-panel rounded-2xl space-y-4 hover:border-violet-500/50 transition duration-300 group">
          <div className="w-12 h-12 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center border border-violet-500/30 group-hover:scale-110 transition">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Merchant Ops</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Catalog management, live pricing controls, AI Readiness Passport, and order fulfillments.
          </p>
          <div className="flex items-center text-xs font-semibold text-violet-400 group-hover:translate-x-1 transition">
            Open Merchant <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>

        <Link href="/merchant/growth" className="p-6 glass-panel rounded-2xl space-y-4 hover:border-emerald-500/50 transition duration-300 group">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 group-hover:scale-110 transition">
            <Cpu className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Growth Agent</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Data-driven basket co-occurrence analytics, autonomous upsell & bundle recommendations.
          </p>
          <div className="flex items-center text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition">
            View Analytics <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>

        <Link href="/trust" className="p-6 glass-panel rounded-2xl space-y-4 hover:border-cyan-500/50 transition duration-300 group">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 group-hover:scale-110 transition">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Trust & Proofs</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            12-rule policy engine, SHA-256 sequential audit chain, and cryptographic proof verification.
          </p>
          <div className="flex items-center text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition">
            Inspect Chain <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}
