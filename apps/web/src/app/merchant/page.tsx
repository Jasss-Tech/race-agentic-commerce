'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Store, 
  TrendingUp, 
  ShieldCheck, 
  Package, 
  CreditCard, 
  AlertTriangle, 
  ArrowUpRight, 
  Bot,
  Activity,
  Sparkles,
  Users
} from 'lucide-react';
import { fetchApi } from '../../lib/api';

export default function MerchantPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchApi<any>('/api/merchant/dashboard');
        setData(res);
      } catch (err) {
        console.error('Failed to load merchant dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-slate-400">
        Loading Merchant Studio metrics...
      </div>
    );
  }

  const { merchant, kpis, recentOrders } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Merchant Header */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-brand-accent text-white flex items-center justify-center font-bold text-xl shadow-lg">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-white">{merchant.name}</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40">
                Agent-Enabled Merchant
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">{merchant.description}</p>
          </div>
        </div>

        {/* Quick Passport Badge */}
        <Link
          href="/merchant/passport"
          className="p-3 rounded-xl bg-surface/80 border border-indigo-500/30 hover:border-indigo-400 text-right group transition-all"
        >
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Agent Passport Score</span>
          <div className="flex items-center justify-end space-x-2 mt-0.5">
            <ShieldCheck className="w-5 h-5 text-brand-accent group-hover:scale-110 transition-transform" />
            <span className="text-xl font-extrabold font-mono text-white">{merchant.aiReadinessScore}/100</span>
          </div>
        </Link>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Net Revenue</span>
            <CreditCard className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 text-2xl font-extrabold font-mono text-white">₹{kpis.totalRevenue.toLocaleString()}</div>
          <div className="mt-1 flex items-center text-[11px] text-emerald-400 space-x-1">
            <span>↑ 18.4%</span>
            <span className="text-slate-500">vs non-agentic baseline</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Average Order Value</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 text-2xl font-extrabold font-mono text-white">₹{kpis.averageOrderValue.toLocaleString()}</div>
          <div className="mt-1 flex items-center text-[11px] text-indigo-400 space-x-1">
            <span>Target: ₹2,600</span>
            <span className="text-slate-500">(via Growth Agent)</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Agent Conversion Rate</span>
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3 text-2xl font-extrabold font-mono text-white">{kpis.conversionRate}%</div>
          <div className="mt-1 flex items-center text-[11px] text-cyan-400 space-x-1">
            <span>3.2x higher</span>
            <span className="text-slate-500">than standard browser flow</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Policy Blocked Attempts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 text-2xl font-extrabold font-mono text-amber-300">{kpis.blockedTransactionsCount}</div>
          <div className="mt-1 text-[11px] text-slate-400">
            Protected by deterministic policy gate
          </div>
        </div>
      </div>

      {/* Two Column Grid: Growth Agent Opportunities & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Growth Opportunities Teaser (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Merchant Growth Agent Insights</h2>
            </div>
            <Link
              href="/merchant/growth"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 font-semibold"
            >
              <span>View All Opportunities ({kpis.growthOpportunitiesCount})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-emerald-500/30 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  HIGH CONFIDENCE CROSS-SELL (88%)
                </span>
                <h3 className="text-base font-bold text-white mt-2">
                  Bundle Mechanical Keyboard + Memory Foam Wrist Rest
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Organic attach rate is currently 8.2%. The Growth Agent projects a lift to 14.5% if offered as a delegated basket addition at a 15% accessory incentive during agentic checkout.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface/80 border border-white/5 grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500">CURRENT AOV</span>
                <div className="font-bold text-slate-200">₹2,199</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500">EXPECTED AOV</span>
                <div className="font-bold text-emerald-400">₹2,538</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-500">PROJECTED LIFT</span>
                <div className="font-bold text-indigo-300">+₹18,450</div>
              </div>
            </div>

            <Link
              href="/merchant/growth"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold text-xs flex items-center justify-center space-x-1.5 shadow-md"
            >
              <span>Review & Approve Campaign in Growth Hub →</span>
            </Link>
          </div>
        </div>

        {/* Recent Transactions & Audit Stream (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <h2 className="text-base font-bold text-white">Recent Transactions</h2>
            </div>
            <Link href="/audit" className="text-xs text-slate-400 hover:text-white">
              Audit Stream →
            </Link>
          </div>

          <div className="rounded-2xl glass-panel border border-white/10 divide-y divide-white/5 overflow-hidden">
            {recentOrders.length > 0 ? (
              recentOrders.map((o: any) => (
                <div key={o.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-white">{o.id}</span>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(o.createdAt).toLocaleTimeString()} · Razorpay Delegated
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-emerald-400">₹{o.amount}</div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                      {o.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-xs text-slate-500">No orders recorded yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
