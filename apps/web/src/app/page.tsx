'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Bot, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Zap, 
  FileCheck, 
  Activity, 
  CreditCard,
  AlertTriangle,
  Scale
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono mb-6">
          <Sparkles className="w-3.5 h-3.5 text-brand-accent animate-spin" />
          <span>Razorpay AI Growth & Agentic Commerce Buildathon Track</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Where AI can act — <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-brand-accent to-emerald-400">
            without losing control.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          RACE is the agentic commerce control plane that enables AI agents to discover, negotiate, and purchase while bounded by deterministic policy engines, explainable risk scoring, and cryptographic proofs on Razorpay.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/demo"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-brand-accent text-white font-semibold text-sm shadow-lg glow-brand hover:scale-105 transition-all flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Hackathon Demo Suite</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/buyer"
            className="px-6 py-3.5 rounded-xl bg-surface border border-white/10 hover:border-white/20 text-slate-200 font-semibold text-sm hover:bg-white/5 transition-all flex items-center space-x-2"
          >
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>Experience Buyer Agent</span>
          </Link>
          <Link
            href="/merchant/growth"
            className="px-6 py-3.5 rounded-xl bg-surface border border-white/10 hover:border-white/20 text-slate-200 font-semibold text-sm hover:bg-white/5 transition-all flex items-center space-x-2"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Merchant Growth Agent</span>
          </Link>
        </div>

        {/* Principle Banner */}
        <div className="mt-12 max-w-3xl mx-auto p-4 rounded-xl glass-card border border-indigo-500/20 flex items-center justify-center space-x-4 text-xs sm:text-sm text-slate-300">
          <Scale className="w-5 h-5 text-indigo-400 flex-shrink-0" />
          <span>
            <strong className="text-white font-semibold">Core Principle: Capability ≠ Authority.</strong> LLMs formulate structured intent; deterministic backend policy gates enforce financial execution.
          </span>
        </div>
      </section>

      {/* Control Plane Architecture Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white tracking-tight">The 9-Stage Zero-Trust Execution Pipeline</h2>
          <p className="text-slate-400 text-sm mt-1">
            How autonomous buyer and merchant agents safely interact with Razorpay Test Mode
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Step 1 */}
          <div className="p-4 rounded-xl glass-panel border-indigo-500/30 hover:border-indigo-500 transition-all flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-mono font-bold text-xs mb-3">
                01
              </div>
              <h3 className="font-semibold text-sm text-white flex items-center space-x-1.5">
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>Buyer Agent</span>
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Interprets natural language & searches machine-readable ACP commerce feed.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-white/5 font-mono text-[10px] text-indigo-400">
              Tool: search_catalog
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-xl glass-panel border-brand-accent/30 hover:border-brand-accent transition-all flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-mono font-bold text-xs mb-3">
                02
              </div>
              <h3 className="font-semibold text-sm text-white flex items-center space-x-1.5">
                <Lock className="w-4 h-4 text-brand-accent" />
                <span>Intent Mandate</span>
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Cryptographically bounds budget cap, allowed categories, and expiration.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-white/5 font-mono text-[10px] text-cyan-400">
              Max Cap: ₹2,500 INR
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-xl glass-panel border-emerald-500/30 hover:border-emerald-500 transition-all flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-mono font-bold text-xs mb-3">
                03
              </div>
              <h3 className="font-semibold text-sm text-white flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Policy & Risk Engine</span>
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                12 deterministic rules + explainable 0-100 risk scoring. Detects price drift.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-white/5 font-mono text-[10px] text-emerald-400">
              Rule 007: Price Drift Safe
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-xl glass-panel border-blue-500/30 hover:border-blue-500 transition-all flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/40 text-blue-300 flex items-center justify-center font-mono font-bold text-xs mb-3">
                04
              </div>
              <h3 className="font-semibold text-sm text-white flex items-center space-x-1.5">
                <CreditCard className="w-4 h-4 text-brand-razorblue" />
                <span>Razorpay Gateway</span>
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Server-side order generation with HMAC-SHA256 signature verification.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-white/5 font-mono text-[10px] text-blue-400">
              Test Mode Delegated Pay
            </div>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-xl glass-panel border-purple-500/30 hover:border-purple-500 transition-all flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center font-mono font-bold text-xs mb-3">
                05
              </div>
              <h3 className="font-semibold text-sm text-white flex items-center space-x-1.5">
                <FileCheck className="w-4 h-4 text-purple-400" />
                <span>SHA-256 Proof</span>
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Tamper-evident hash chain block emitted with verifiable certificate.
              </p>
            </div>
            <div className="mt-4 pt-2 border-t border-white/5 font-mono text-[10px] text-purple-400">
              H_n = SHA256(H_prev + E_n)
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl glass-card border border-white/10 hover:border-indigo-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-4">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Autonomous Buyer Agent</h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Discovers products, compares technical specifications, explains trade-offs, and delegates checkout through explicit intent mandates without exposing payment credentials.
            </p>
            <Link href="/buyer" className="mt-4 inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 space-x-1">
              <span>Open Buyer Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl glass-card border border-white/10 hover:border-emerald-500/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Merchant Growth Agent</h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Analyzes historical basket clusters to discover high-converting cross-sells, upsells, and bundle opportunities with attach rate lift projections requiring merchant signoff.
            </p>
            <Link href="/merchant/growth" className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-400 hover:text-emerald-300 space-x-1">
              <span>Inspect Growth Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl glass-card border border-white/10 hover:border-brand-accent/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Merchant Agent Passport</h3>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Standardized AI-readiness scorecard (94/100) auditing catalog quality, machine-readable specifications, price integrity, inventory reliability, and delegated return policies.
            </p>
            <Link href="/merchant/passport" className="mt-4 inline-flex items-center text-xs font-semibold text-cyan-400 hover:text-cyan-300 space-x-1">
              <span>View Agent Passport</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Signature Demo Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-surface to-panel border border-indigo-500/30 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center space-x-1.5 text-xs font-mono text-brand-accent bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/30">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Featured Hackathon Benchmark</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Price-Drift Protection in Action
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Experience what happens when a live product price changes from ₹2,199 to ₹2,799 right before execution. Watch RACE’s deterministic policy gate instantly block the transaction while preserving a complete cryptographic audit trail.
              </p>
            </div>
            <Link
              href="/demo"
              className="px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-brand-accent text-white font-bold text-sm shadow-xl glow-brand hover:scale-105 transition-all flex items-center space-x-2 flex-shrink-0"
            >
              <span>Test Price-Drift Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
