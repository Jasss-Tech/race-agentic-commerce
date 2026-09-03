'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sliders, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Percent, 
  RefreshCw, 
  Layers, 
  ArrowRight, 
  HelpCircle,
  BarChart3,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { runWhatIfSimulation } from '../../../lib/intelligence';
import { FactorImportance } from '../../../components/charts/FactorImportance';
import { AreaChart } from '../../../components/charts/AreaChart';
import { realtimeBus } from '../../../lib/realtime';

export default function SimulationLabPage() {
  const [priceDelta, setPriceDelta] = useState<number>(5);
  const [discountPercent, setDiscountPercent] = useState<number>(10);
  const [targetSegment, setTargetSegment] = useState<'ALL' | 'HIGH_INTENT' | 'RETURNING' | 'AT_RISK' | 'NEW'>('RETURNING');
  const [bundleDiscount, setBundleDiscount] = useState<number>(15);
  const [inventoryBoost, setInventoryBoost] = useState<number>(20);
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null);

  const simulation = runWhatIfSimulation({
    priceDeltaPercent: priceDelta,
    discountPercent,
    targetSegment,
    bundleAccessoryDiscount: bundleDiscount,
    inventoryBoostPercent: inventoryBoost
  });

  const handleApplyStrategy = (strategyName: string) => {
    setAppliedMessage(`Strategy "${strategyName}" committed to live policy gate & growth agent.`);
    
    // Broadcast real-time event
    realtimeBus.publish({
      eventType: 'CAMPAIGN_ACTIVATED',
      actorName: 'Simulation Lab Optimizer',
      actorRole: 'MERCHANT',
      description: `Applied What-If strategy: Price ${priceDelta >= 0 ? '+' : ''}${priceDelta}%, Bundle ${bundleDiscount}% incentive.`,
      badgeType: 'purple'
    });

    setTimeout(() => setAppliedMessage(null), 5000);
  };

  const comparisonChartData = [
    { label: 'Baseline', value: 842000, secondaryValue: 288000 },
    { label: 'Simulated Strategy', value: simulation.predictedRevenue, secondaryValue: simulation.predictedProfit },
    { label: 'Optimal Benchmark', value: 894000, secondaryValue: 312000 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-indigo-600 to-brand-accent text-white flex items-center justify-center font-bold shadow-lg">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-white">What-If AI Simulation Lab</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/40">
                PREDICTIVE PRICING & ELASTICITY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Simulate price shifts, discount incentives, and accessory bundles against live customer elasticity models before executing.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
          <Sparkles className="w-4 h-4" />
          <span>Confidence: {(simulation.confidenceScore * 100).toFixed(0)}%</span>
        </div>
      </div>

      {appliedMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-300 flex items-center space-x-2 shadow-lg animate-bounce">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-semibold">{appliedMessage}</span>
        </div>
      )}

      {/* Main Grid: Parameter Controls (5 cols) & Projected Simulation Results (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Parameter Sliders Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Scenario Levers & Controls
              </h2>
              <button
                onClick={() => {
                  setPriceDelta(5);
                  setDiscountPercent(10);
                  setBundleDiscount(15);
                }}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-mono"
              >
                Reset Optimal
              </button>
            </div>

            {/* Price Delta Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Base Catalog Price Shift</span>
                <span className={`font-bold ${priceDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {priceDelta >= 0 ? '+' : ''}{priceDelta}%
                </span>
              </div>
              <input
                type="range"
                min="-25"
                max="25"
                step="1"
                value={priceDelta}
                onChange={(e) => setPriceDelta(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>-25% (Volume)</span>
                <span>0% (Baseline)</span>
                <span>+25% (Premium)</span>
              </div>
            </div>

            {/* Accessory Bundle Incentive Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Accessory Bundle Incentive</span>
                <span className="text-cyan-400 font-bold">{bundleDiscount}% Off</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={bundleDiscount}
                onChange={(e) => setBundleDiscount(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0%</span>
                <span>15% (Recommended)</span>
                <span>30%</span>
              </div>
            </div>

            {/* Target Customer Segment Selection */}
            <div className="space-y-2">
              <span className="text-xs font-mono text-slate-300">Target Customer Cohort</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'ALL', label: 'All Shoppers' },
                  { key: 'RETURNING', label: 'Returning Buyers' },
                  { key: 'HIGH_INTENT', label: 'High Intent' },
                  { key: 'AT_RISK', label: 'Win-Back / At-Risk' }
                ].map((seg) => (
                  <button
                    key={seg.key}
                    onClick={() => setTargetSegment(seg.key as any)}
                    className={`py-2 px-3 rounded-xl text-xs font-mono transition-all border text-left ${
                      targetSegment === seg.key
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                        : 'bg-surface/80 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {seg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory Buffer Booster */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Safety Stock Buffer Boost</span>
                <span className="text-emerald-400 font-bold">+{inventoryBoost}% units</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="10"
                value={inventoryBoost}
                onChange={(e) => setInventoryBoost(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Projected Simulation Results Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key Simulation Output KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Projected Net Revenue</span>
              <div className="text-2xl font-extrabold text-white font-mono">
                ₹{simulation.predictedRevenue.toLocaleString()}
              </div>
              <div className={`text-xs font-mono font-bold ${
                simulation.revenueDeltaPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {simulation.revenueDeltaPct >= 0 ? '↑ +' : '↓ '}{simulation.revenueDeltaPct}% vs baseline
              </div>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Projected Profit Margin</span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                ₹{simulation.predictedProfit.toLocaleString()}
              </div>
              <div className="text-xs font-mono text-emerald-400 font-bold">
                {simulation.profitDeltaPct >= 0 ? '↑ +' : '↓ '}{simulation.profitDeltaPct}% expansion
              </div>
            </div>

            <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Conversion Rate</span>
              <div className="text-2xl font-extrabold text-cyan-400 font-mono">
                {simulation.predictedConversionRate}%
              </div>
              <div className="text-xs font-mono text-slate-400">
                Demand Index: {simulation.customerDemandIndex}
              </div>
            </div>
          </div>

          {/* AI Decision Verdict & Recommendation */}
          <div className="p-6 rounded-2xl glass-panel border border-indigo-500/30 space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand-accent" />
              <h3 className="font-bold text-white text-sm">AI Recommendation & Elasticity Reasoning</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{simulation.aiRecommendation}</p>
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-[11px] font-mono text-slate-400">Optimal Price Boundary: -2% to +8%</span>
              <button
                onClick={() => handleApplyStrategy(simulation.scenarioName)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Apply This Strategy</span>
              </button>
            </div>
          </div>

          {/* Explainable AI Feature Decomposition */}
          <FactorImportance
            factors={simulation.factorImportance}
            title="What-If Model Attribution (SHAP Factors)"
          />

          {/* Multi-Scenario Strategy Matrix */}
          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-3">
            <h3 className="font-bold text-white text-xs uppercase font-mono tracking-wider">
              Comparative Strategy Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="text-slate-400 text-[10px] border-b border-white/10 uppercase">
                  <tr>
                    <th className="pb-2">Strategy</th>
                    <th className="pb-2">Price Delta</th>
                    <th className="pb-2">Expected Revenue</th>
                    <th className="pb-2">Margin Lift</th>
                    <th className="pb-2 text-right">Verdict</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {simulation.scenariosComparison.map((sc, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 font-bold text-white">{sc.strategyName}</td>
                      <td className="py-2.5 text-slate-300">{sc.priceDelta >= 0 ? '+' : ''}{sc.priceDelta}%</td>
                      <td className="py-2.5 text-emerald-400">₹{sc.expectedRevenue.toLocaleString()}</td>
                      <td className="py-2.5 text-indigo-300">₹{sc.expectedMargin.toLocaleString()}</td>
                      <td className="py-2.5 text-right">
                        {sc.isOptimal ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                            ★ OPTIMAL
                          </span>
                        ) : (
                          <button
                            onClick={() => handleApplyStrategy(sc.strategyName)}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 underline"
                          >
                            Select
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
