'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Zap, 
  Layers, 
  Percent, 
  BarChart3,
  Bot
} from 'lucide-react';
import { fetchApi } from '../../../lib/api';

export default function MerchantGrowthPage() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetchApi<any[]>('/api/growth/recommendations');
      setRecommendations(res);
    } catch (err) {
      console.error('Failed to load growth recommendations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetchApi<any>(`/api/growth/recommendations/${id}/approve`, {
        method: 'POST'
      });
      setActionMessage(res.message || 'Campaign approved and active for agent delegation.');
      loadRecommendations();
      setTimeout(() => setActionMessage(null), 5000);
    } catch (err: any) {
      alert(`Approval error: ${err.message}`);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await fetchApi<any>(`/api/growth/recommendations/${id}/reject`, {
        method: 'POST'
      });
      loadRecommendations();
    } catch (err: any) {
      alert(`Reject error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-white">Merchant Growth Agent</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40">
                PROACTIVE COMMERCE AI
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Autonomous basket analysis discovering cross-sells, upsells, and bundle incentives from live order patterns.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
          <Bot className="w-4 h-4" />
          <span>Human-in-the-Loop Signoff Active</span>
        </div>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Recommendations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.map((rec) => {
          const impact = rec.expectedImpact || {};
          const isApproved = rec.status === 'APPROVED';
          const isRejected = rec.status === 'REJECTED';

          return (
            <div
              key={rec.id}
              className={`p-6 rounded-2xl glass-card border transition-all flex flex-col justify-between space-y-4 ${
                isApproved
                  ? 'border-emerald-500/40 bg-emerald-950/20 glow-emerald'
                  : isRejected
                  ? 'border-red-500/30 opacity-60'
                  : 'border-white/10 hover:border-indigo-500/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                    {rec.type} · {(rec.confidence * 100).toFixed(0)}% Confidence
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      isApproved
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : isRejected
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {rec.status}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white mt-3 leading-snug">{rec.recommendation}</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{rec.reason}</p>
              </div>

              {/* Impact Metrics Block */}
              <div className="p-3.5 rounded-xl bg-surface/90 border border-white/5 space-y-2 text-xs font-mono">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Estimated Financial Impact
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500">Current AOV</span>
                    <span className="text-slate-200">₹{impact.currentAov}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500">Target AOV</span>
                    <span className="text-emerald-400 font-bold">₹{impact.expectedAov}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500">Attach Rate</span>
                    <span className="text-indigo-300">{impact.currentAttachRate}% → {impact.targetAttachRate}%</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] text-slate-500">Projected Lift</span>
                    <span className="text-emerald-300 font-bold">+₹{impact.projectedRevenueLift?.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {!isApproved && !isRejected && (
                <div className="flex items-center space-x-2 pt-2">
                  <button
                    onClick={() => handleApprove(rec.id)}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs flex items-center justify-center space-x-1 shadow-md transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Proposal</span>
                  </button>
                  <button
                    onClick={() => handleReject(rec.id)}
                    className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-red-400 text-xs font-medium border border-white/5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {isApproved && (
                <div className="py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center text-xs font-mono text-emerald-300 flex items-center justify-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Campaign Active for Agent Checkout</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
