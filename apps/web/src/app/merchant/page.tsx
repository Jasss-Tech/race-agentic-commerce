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
  Users,
  Search,
  Sliders,
  Play,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Zap,
  Clock,
  RefreshCw,
  BellRing,
  Cpu,
  Layers
} from 'lucide-react';
import { fetchApi } from '../../lib/api';
import { AreaChart } from '../../components/charts/AreaChart';
import { DonutGauge } from '../../components/charts/DonutGauge';
import { Sparkline } from '../../components/charts/Sparkline';
import { FactorImportance } from '../../components/charts/FactorImportance';
import { realtimeBus } from '../../lib/realtime';
import { 
  getBusinessHealthScore, 
  getSituationSummary, 
  getAIInsights, 
  getAnomalies 
} from '../../lib/intelligence';
import { RealtimeActivityEvent } from '@race/types';

export default function MerchantPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activityEvents, setActivityEvents] = useState<RealtimeActivityEvent[]>([]);
  const [selectedInsight, setSelectedInsight] = useState<any>(null);
  const [investigateModal, setInvestigateModal] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Decision Intelligence State
  const healthScore = getBusinessHealthScore();
  const situationSummary = getSituationSummary();
  const [insights, setInsights] = useState(getAIInsights());
  const anomalies = getAnomalies();

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

    // Subscribe to real-time events
    setActivityEvents(realtimeBus.getHistory());
    const unsub = realtimeBus.subscribe((newEvent) => {
      setActivityEvents((prev) => [newEvent, ...prev].slice(0, 30));
    });

    return () => unsub();
  }, []);

  const handleApplyInsight = (insightId: string) => {
    setInsights((prev) =>
      prev.map((ins) => (ins.id === insightId ? { ...ins, status: 'APPLIED' } : ins))
    );
    setActionSuccessMsg('Action executed successfully. Autonomous campaign parameter activated.');

    // Publish event to real-time bus
    realtimeBus.publish({
      eventType: 'CAMPAIGN_ACTIVATED',
      actorName: 'Merchant Administrator',
      actorRole: 'MERCHANT',
      description: 'Approved AI optimization recommendation. Automated policy rules updated.',
      badgeType: 'purple'
    });

    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const revenueChartData = [
    { label: 'Day 1', value: 24000, secondaryValue: 22000 },
    { label: 'Day 5', value: 38000, secondaryValue: 31000 },
    { label: 'Day 10', value: 45000, secondaryValue: 39000 },
    { label: 'Day 15', value: 58000, secondaryValue: 46000 },
    { label: 'Day 20', value: 72000, secondaryValue: 54000 },
    { label: 'Day 25', value: 94000, secondaryValue: 68000 },
    { label: 'Day 30 (Forecast)', value: 118000, secondaryValue: 84000 }
  ];

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-slate-400 space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
        <p className="text-sm font-mono">Initializing AI Decision Command Center...</p>
      </div>
    );
  }

  const { merchant, kpis, recentOrders } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. TOP HEADER & BUSINESS HEALTH SCORE BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Merchant Profile & Live Status (7 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl glass-panel border border-white/10 flex flex-col justify-between space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-brand-razorblue to-brand-accent text-white flex items-center justify-center font-bold text-xl shadow-lg glow-brand">
                <Store className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-extrabold text-white tracking-tight">{merchant.name}</h1>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40">
                    ● Agent-Enabled
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">{merchant.description}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <Link
                href="/merchant/simulation"
                className="px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center space-x-1.5 transition-all"
              >
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>Simulation Lab</span>
              </Link>
              <Link
                href="/merchant/passport"
                className="px-3.5 py-2 rounded-xl bg-surface border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-300 flex items-center space-x-1.5 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Passport (94/100)</span>
              </Link>
            </div>
          </div>

          {/* Business Health Dimension Micro-Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/5 text-xs font-mono">
            <div className="p-3 rounded-xl bg-surface/70 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Revenue Growth</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">₹8.42L</span>
                <span className="text-[11px] text-emerald-400 font-bold">↑ 12.4%</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface/70 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Average Order</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">₹2,462</span>
                <span className="text-[11px] text-emerald-400 font-bold">↑ 15.1%</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface/70 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Conversion Rate</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">4.8%</span>
                <span className="text-[11px] text-rose-400 font-bold">↓ 1.2%</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface/70 border border-white/5 space-y-1">
              <span className="text-[10px] text-slate-400 uppercase">Policy Zero-Drift</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-400">100%</span>
                <span className="text-[10px] text-slate-400">Deterministic</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Business Health Score Meter (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl glass-card border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 to-panel flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-3 left-4 text-[10px] font-mono text-indigo-300 uppercase tracking-wider">
            Composite Health Index
          </div>
          <div className="my-2">
            <DonutGauge score={healthScore.overall} size={150} strokeWidth={14} />
          </div>
          <div className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Optimal Business & Agent Health</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-tight">
            Calculated across 8 dimensions including revenue velocity, customer retention, and deterministic policy integrity.
          </p>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-300 flex items-center space-x-2 shadow-lg animate-bounce">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold">{actionSuccessMsg}</span>
        </div>
      )}

      {/* 2. AI EXECUTIVE SITUATION SUMMARY (WHAT HAPPENED -> WHY -> NEXT -> ACTION) */}
      <div className="p-6 rounded-2xl glass-panel border border-indigo-500/30 space-y-5 relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-brand-accent animate-spin" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-indigo-300 uppercase tracking-wider">
                Autonomous Intelligence Layer
              </div>
              <h2 className="text-base font-bold text-white">{situationSummary.headline}</h2>
            </div>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Updated {situationSummary.generatedAt}</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">{situationSummary.narrative}</p>

        {/* 3 Columns: WHY -> WHAT HAPPENS NEXT -> WHAT TO DO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
          {/* Why This Happened */}
          <div className="p-4 rounded-xl bg-surface/80 border border-white/5 space-y-2">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Why This Happened</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px] leading-snug">
              {situationSummary.whyThisHappened.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What Will Happen Next */}
          <div className="p-4 rounded-xl bg-surface/80 border border-white/5 space-y-2">
            <div className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>What Will Happen Next</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px] leading-snug">
              {situationSummary.whatWillHappenNext.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What Should You Do */}
          <div className="p-4 rounded-xl bg-surface/80 border border-emerald-500/20 space-y-2">
            <div className="text-[10px] font-mono uppercase font-bold text-emerald-300 tracking-wider flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Recommended Decisions</span>
            </div>
            <div className="space-y-2 pt-1">
              {situationSummary.whatShouldYouDo.map((act) => (
                <div
                  key={act.id}
                  className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-white text-[11px]">{act.actionTitle}</div>
                    <div className="text-[10px] text-emerald-400">{act.impactText}</div>
                  </div>
                  {act.type === 'SIMULATE' ? (
                    <Link
                      href="/merchant/simulation"
                      className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-semibold flex items-center space-x-1"
                    >
                      <span>Simulate</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : act.type === 'INVESTIGATE' ? (
                    <button
                      onClick={() => setInvestigateModal(act.actionTitle)}
                      className="px-2.5 py-1 rounded bg-surface hover:bg-white/10 border border-white/10 text-white text-[10px] font-semibold"
                    >
                      Investigate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApplyInsight('ins_1')}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold"
                    >
                      Apply
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. TWO COLUMN GRID: ACTIONABLE AI INSIGHTS & REAL-TIME ACTIVITY STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Prioritized AI Insights (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-brand-accent" />
              <h2 className="text-base font-bold text-white">Prioritized AI Insights & Actions</h2>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {insights.filter((i) => i.status === 'PENDING').length} Pending Review
            </span>
          </div>

          <div className="space-y-4">
            {insights.map((insight) => {
              const isApplied = insight.status === 'APPLIED';
              const isCritical = insight.severity === 'CRITICAL';
              const isOpportunity = insight.severity === 'OPPORTUNITY';

              return (
                <div
                  key={insight.id}
                  className={`p-5 rounded-2xl glass-card border transition-all space-y-3 ${
                    isApplied
                      ? 'border-emerald-500/40 bg-emerald-950/20 glow-emerald'
                      : isCritical
                      ? 'border-red-500/40 bg-red-950/10'
                      : isOpportunity
                      ? 'border-indigo-500/30 hover:border-indigo-400'
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                            isCritical
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : isOpportunity
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}
                        >
                          {insight.category} · {(insight.confidence * 100).toFixed(0)}% Confidence
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{insight.createdAt}</span>
                      </div>
                      <h3 className="font-bold text-white text-sm mt-1">{insight.title}</h3>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[9px] uppercase font-mono text-slate-400">Projected Impact</span>
                      <div className="font-mono font-bold text-emerald-400 text-xs">
                        {insight.impactEstimated}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{insight.explanation}</p>

                  <div className="p-3 rounded-xl bg-surface/80 border border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">
                      <strong className="text-slate-200">Recommended:</strong> {insight.recommendedAction}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <Link
                      href="/merchant/simulation"
                      className="px-3 py-1.5 rounded-lg bg-surface hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold flex items-center space-x-1"
                    >
                      <Sliders className="w-3 h-3 text-indigo-400" />
                      <span>Simulate Outcome</span>
                    </Link>
                    {!isApplied ? (
                      <button
                        onClick={() => handleApplyInsight(insight.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs flex items-center space-x-1 shadow-md"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Apply Recommendation</span>
                      </button>
                    ) : (
                      <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Recommendation Active</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Real-Time Activity Feed & Anomaly Sentinel (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Anomaly Radar Card */}
          <div className="p-5 rounded-2xl glass-card border border-amber-500/30 bg-amber-950/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Active Anomaly Sentinel</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                1 ATTENTION ITEM
              </span>
            </div>

            {anomalies.map((anom) => (
              <div key={anom.id} className="p-3.5 rounded-xl bg-surface/90 border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-amber-300 font-bold">{anom.metricName}</span>
                  <span className="text-slate-400">{anom.detectedAt}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-snug">{anom.rootCauseAnalysis}</p>
                <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>Deviation: +{anom.deviationStdDev}σ</span>
                  <span className="text-rose-400 font-bold">{anom.estimatedFinancialImpact}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Live Activity Stream */}
          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">Real-Time Event Stream</h3>
              </div>
              <div className="flex items-center space-x-1.5 text-[10px] font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Connected</span>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {activityEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-surface/70 border border-white/5 text-xs font-mono flex items-start space-x-2.5 hover:bg-white/5 transition-colors"
                >
                  <span className="text-[10px] text-slate-500 pt-0.5">{evt.timestamp}</span>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold text-white text-[11px]">{evt.actorName}</span>
                      <span className="text-[9px] px-1 rounded bg-white/10 text-slate-300 uppercase">
                        {evt.actorRole}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans leading-tight">{evt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. REVENUE TREND & 30-DAY FORECAST SECTION */}
      <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">
              Predictive Revenue Velocity
            </div>
            <h2 className="text-base font-bold text-white">30-Day Autoregressive Revenue Forecast (₹10.1L Projected)</h2>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="text-emerald-400 font-bold">Confidence: 91%</span>
            <span className="text-slate-400">Expected Range: ₹9.6L – ₹10.7L</span>
          </div>
        </div>

        <AreaChart
          data={revenueChartData}
          height={200}
          color="#6366f1"
          secondaryColor="#06b6d4"
          valuePrefix="₹"
        />
      </div>

      {/* 5. INVESTIGATION MODAL */}
      {investigateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-6 rounded-2xl glass-panel border border-indigo-500/50 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Search className="w-4 h-4 text-indigo-400" />
                <span>AI Root-Cause Investigation</span>
              </h3>
              <button
                onClick={() => setInvestigateModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p className="font-semibold text-white">Target: {investigateModal}</p>
              <div className="p-3.5 rounded-xl bg-surface/90 border border-white/5 space-y-2 font-mono text-[11px]">
                <div>• Analyzed: 4,218 mobile user checkout flows</div>
                <div>• Drop-off Point: Mandate permission modal (3.8s render time)</div>
                <div>• Impacted Device Profile: iOS / WebKit Safari Mobile</div>
                <div className="text-emerald-400 font-bold">• Solution: Deploy 1-tap pre-signed biometric mandate token</div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setInvestigateModal(null)}
                className="px-4 py-2 rounded-xl bg-surface border border-white/10 text-xs font-semibold text-slate-300"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  setInvestigateModal(null);
                  handleApplyInsight('ins_2');
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center space-x-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Deploy Optimization</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
