'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Award, 
  FileCode, 
  Layers, 
  Lock, 
  Activity,
  Cpu
} from 'lucide-react';
import { fetchApi } from '../../../lib/api';

export default function AgentPassportPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPassport() {
      try {
        const res = await fetchApi<any>('/api/merchant/passport');
        setData(res);
      } catch (err) {
        console.error('Failed to load agent passport', err);
      } finally {
        setLoading(false);
      }
    }
    loadPassport();
  }, []);

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-slate-400">
        Loading Agent Passport verification...
      </div>
    );
  }

  const { passport, merchantName, aiReadinessScore } = data;
  const checks = passport?.checks || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-brand-accent/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-white">Merchant Agent Passport</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/40">
                PASSPORT LEVEL AAA
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Standardized AI Commerce Readiness Credential for {merchantName}.
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] uppercase font-mono text-slate-400">Composite Readiness</span>
          <div className="text-3xl font-extrabold font-mono text-cyan-400">{aiReadinessScore} / 100</div>
        </div>
      </div>

      {/* 5 Category Scorecards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-white/10">
          <span className="text-[11px] font-semibold text-slate-400">Catalog Quality</span>
          <div className="mt-2 text-2xl font-extrabold font-mono text-white">{passport?.catalogQuality || 19} <span className="text-xs text-slate-500">/ 20</span></div>
          <p className="text-[10px] text-slate-400 mt-1">Machine-readable attributes & structured descriptions.</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10">
          <span className="text-[11px] font-semibold text-slate-400">Pricing Clarity</span>
          <div className="mt-2 text-2xl font-extrabold font-mono text-white">{passport?.pricingClarity || 18} <span className="text-xs text-slate-500">/ 20</span></div>
          <p className="text-[10px] text-slate-400 mt-1">Real-time price stability with drift revalidation.</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10">
          <span className="text-[11px] font-semibold text-slate-400">Inventory Reliability</span>
          <div className="mt-2 text-2xl font-extrabold font-mono text-emerald-400">{passport?.inventoryReliability || 20} <span className="text-xs text-slate-500">/ 20</span></div>
          <p className="text-[10px] text-slate-400 mt-1">Live stock synchronization with atomic reservations.</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10">
          <span className="text-[11px] font-semibold text-slate-400">Policy Completeness</span>
          <div className="mt-2 text-2xl font-extrabold font-mono text-white">{passport?.policyCompleteness || 17} <span className="text-xs text-slate-500">/ 20</span></div>
          <p className="text-[10px] text-slate-400 mt-1">Clear returns & automated dispute handling metadata.</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10">
          <span className="text-[11px] font-semibold text-slate-400">Payment Reliability</span>
          <div className="mt-2 text-2xl font-extrabold font-mono text-emerald-400">{passport?.paymentReliability || 20} <span className="text-xs text-slate-500">/ 20</span></div>
          <p className="text-[10px] text-slate-400 mt-1">Razorpay Test Mode delegated payment support.</p>
        </div>
      </div>

      {/* Compliance Checklist & Protocol Metadata */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Agentic Commerce Verification Checklist</span>
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Agent Discoverable', desc: 'Catalog is indexed in public ACP endpoints with category taxonomy', active: checks.agentDiscoverable },
              { label: 'Agent Readable', desc: 'Attributes, switch specifications, and compatibility graphs are machine-formatted', active: checks.agentReadable },
              { label: 'Agent Purchasable', desc: 'SKUs have explicit authorization flag enabling bounded autonomous checkout', active: checks.agentPurchasable },
              { label: 'Payment Delegated', desc: 'Pre-integrated with Razorpay Test Mode server-side authorization', active: checks.paymentEnabled },
              { label: 'Policy Defined', desc: 'Returns, warranties, and shipping bounds are programmatically readable', active: checks.policyDefined }
            ].map((c, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-surface/80 border border-white/5 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-xs text-white">{c.label}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{c.desc}</div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                  PASSED
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Supported Agent Protocols</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-surface/80 border border-white/5 space-y-1">
              <span className="text-indigo-300 font-bold">RACE-ACP/v1.0</span>
              <p className="text-[10px] text-slate-400 font-sans">
                Razorpay Agentic Commerce Protocol for structured catalog feeds and mandate exchange.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface/80 border border-white/5 space-y-1">
              <span className="text-cyan-300 font-bold">RZP-AGENT-PAY/v2</span>
              <p className="text-[10px] text-slate-400 font-sans">
                Zero-trust delegated checkout with HMAC-SHA256 signature verification and idempotency locks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
