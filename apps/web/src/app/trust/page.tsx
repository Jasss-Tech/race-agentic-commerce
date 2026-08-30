'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Layers, 
  Activity, 
  Scale, 
  FileCheck2, 
  CreditCard,
  AlertCircle
} from 'lucide-react';

export default function TrustCenterPage() {
  const rules = [
    { id: 'RULE_001', name: 'Budget Cap Enforcement', desc: 'Transaction amount strictly cannot exceed the user mandate max budget.', status: 'ENFORCED' },
    { id: 'RULE_002', name: 'Currency Consistency', desc: 'Currency requested must match mandate currency (INR).', status: 'ENFORCED' },
    { id: 'RULE_003', name: 'Merchant Authorization', desc: 'Merchant must be verified with active Agent Passport credentials.', status: 'ENFORCED' },
    { id: 'RULE_004', name: 'Product Active Status', desc: 'Product SKU must be active and discoverable in live catalog.', status: 'ENFORCED' },
    { id: 'RULE_005', name: 'Agent-Purchasable Flag', desc: 'Merchant must explicitly authorize autonomous agent purchases on the SKU.', status: 'ENFORCED' },
    { id: 'RULE_006', name: 'Inventory Availability', desc: 'Live warehouse inventory must satisfy requested quantity.', status: 'ENFORCED' },
    { id: 'RULE_007', name: 'Price-Drift Protection', desc: 'Live catalog price must strictly match the validated cart intent before payment execution.', status: 'ENFORCED' },
    { id: 'RULE_008', name: 'Mandate Active Check', desc: 'Intent mandate must be in ACTIVE status (not REVOKED or CONSUMED).', status: 'ENFORCED' },
    { id: 'RULE_009', name: 'Mandate Expiry Enforcement', desc: 'Payment timestamp must not exceed mandate expiration deadline.', status: 'ENFORCED' },
    { id: 'RULE_010', name: 'Action Permission Check', desc: 'Requested action must be present in mandate allowedActions list.', status: 'ENFORCED' },
    { id: 'RULE_011', name: 'Category Bound Check', desc: 'Purchased product category must match user authorized categories.', status: 'ENFORCED' },
    { id: 'RULE_012', name: 'Idempotency Protection', desc: 'Prevents duplicate charges via cryptographic idempotency locks.', status: 'ENFORCED' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">RACE Trust Center</h1>
            <p className="text-xs text-slate-400 mt-1">
              Zero-Trust Architecture: Deterministic Policy Engine, Explainable Risk Gating & Cryptographic Audit Trails.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4" />
          <span>All Control Systems Operational</span>
        </div>
      </div>

      {/* Core Principle Banner */}
      <div className="p-6 rounded-2xl bg-surface/90 border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="space-y-2">
          <div className="flex items-center space-x-2 font-bold text-white text-sm">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span>Capability ≠ Authority</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            AI models suggest purchasing actions based on natural language reasoning, but lack direct financial authority or payment credential access.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2 font-bold text-white text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Deterministic Enforcement</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            12 explicit, non-LLM policy rules evaluate budget caps, live price drift, merchant trust, and inventory before triggering Razorpay order creation.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2 font-bold text-white text-sm">
            <FileCheck2 className="w-4 h-4 text-brand-accent" />
            <span>Tamper-Evident Proofs</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Every authorization, transaction, and state transition emits a SHA-256 hash chained into an immutable audit stream verified on-demand.
          </p>
        </div>
      </div>

      {/* 12 Deterministic Policy Rules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Deterministic Policy Engine Rules (12/12 Active)</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Engine: RACE-DPE/v1.0</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rules.map((r) => (
            <div key={r.id} className="p-4 rounded-xl glass-card border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs text-indigo-300">{r.id}</span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {r.status}
                </span>
              </div>
              <h3 className="font-bold text-xs text-white">{r.name}</h3>
              <p className="text-[11px] text-slate-400 leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
