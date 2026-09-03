'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Package, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  Search, 
  ArrowRight, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle,
  Zap,
  BarChart3,
  Layers,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { 
  getProductIntelligenceList, 
  getCustomerSegments 
} from '../../../lib/intelligence';
import { ForecastBandsChart } from '../../../components/charts/ForecastBandsChart';
import { BarChart } from '../../../components/charts/BarChart';

export default function MerchantIntelligencePage() {
  const [activeTab, setActiveTab] = useState<'products' | 'customers'>('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('prod_intel_1');
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('seg_1');

  const products = getProductIntelligenceList();
  const customerSegments = getCustomerSegments();

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const selectedSegment = customerSegments.find((s) => s.id === selectedSegmentId) || customerSegments[0];

  const filteredProducts = products.filter((p) =>
    p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-indigo-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white flex items-center justify-center font-bold shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-white">Product & Customer Intelligence</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/40">
                DEEP ANALYTICS & PREDICTIONS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Multi-dimensional product scoring, 30-day autoregressive demand forecasts, and behavioral RFM customer segmentation.
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900/80 border border-white/10">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'products'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Product Intelligence ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'customers'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Customer Segments ({customerSegments.length})</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PRODUCT INTELLIGENCE VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Product Selector List (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search products & categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface/90 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-3">
              {filteredProducts.map((p) => {
                const isSelected = p.id === selectedProduct.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProductId(p.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/40 glow-brand'
                        : 'border-white/10 glass-card hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-slate-400">
                          {p.category}
                        </span>
                        <h3 className="font-bold text-white text-sm mt-1.5">{p.productName}</h3>
                        <div className="text-xs text-emerald-400 font-mono font-bold mt-1">₹{p.price.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-400">AI Score</span>
                        <div className="text-base font-extrabold font-mono text-indigo-300">{p.aiScore}/100</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Deep Product Scorecard & 30-Day Forecast (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Top Scorecard Metrics */}
            <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider">
                    Product Intelligence Scorecard
                  </span>
                  <h2 className="text-lg font-bold text-white mt-0.5">{selectedProduct.productName}</h2>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono">Velocity</span>
                    <div className="text-sm font-bold text-emerald-400 font-mono">+{selectedProduct.trendVelocity}%</div>
                  </div>
                  <Link
                    href="/merchant/simulation"
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Simulate Price</span>
                  </Link>
                </div>
              </div>

              {/* 4 Score Gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-surface/80 border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Demand Index</span>
                  <div className="text-xl font-extrabold text-cyan-400 font-mono mt-1">{selectedProduct.demandScore}</div>
                  <span className="text-[10px] text-slate-500">Top 5% category</span>
                </div>
                <div className="p-3 rounded-xl bg-surface/80 border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Conversion Fit</span>
                  <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">{selectedProduct.conversionScore}</div>
                  <span className="text-[10px] text-slate-500">High checkout intent</span>
                </div>
                <div className="p-3 rounded-xl bg-surface/80 border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Profitability</span>
                  <div className="text-xl font-extrabold text-indigo-300 font-mono mt-1">{selectedProduct.profitabilityScore}</div>
                  <span className="text-[10px] text-slate-500">Strong margin</span>
                </div>
                <div className="p-3 rounded-xl bg-surface/80 border border-white/5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Risk Index</span>
                  <div className={`text-xl font-extrabold font-mono mt-1 ${
                    selectedProduct.riskLevel === 'LOW' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {selectedProduct.riskLevel}
                  </div>
                  <span className="text-[10px] text-slate-500">Stable inventory</span>
                </div>
              </div>

              {/* 30-Day Autoregressive Forecast Band */}
              <div className="pt-2">
                <ForecastBandsChart
                  data={selectedProduct.demandForecast30d.map((f, i) => ({
                    label: f.day,
                    predicted: f.predictedUnits,
                    lowerBound: f.lowerBound,
                    upperBound: f.upperBound
                  }))}
                  height={180}
                  valueSuffix=" units"
                  title="30-Day Predictive Demand Projection"
                />
              </div>

              {/* AI Insights & Trade-offs */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold font-mono text-slate-300 uppercase">AI Behavioral Explanations</span>
                <div className="space-y-1.5 text-xs text-slate-300">
                  {selectedProduct.aiInsights.map((insight, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-surface/60 border border-white/5 flex items-start space-x-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Actions */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="text-[11px] font-bold font-mono text-emerald-300 uppercase">Autonomous Opportunities</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedProduct.recommendedActions.map((act, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1 text-xs">
                      <div className="font-bold text-white text-[11px]">{act.action}</div>
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-emerald-400 font-bold">{act.impact}</span>
                        <span className="text-slate-400">{(act.confidence * 100).toFixed(0)}% Conf.</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CUSTOMER SEGMENTATION VIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'customers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Segment Selector (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            {customerSegments.map((seg) => {
              const isSelected = seg.id === selectedSegment.id;
              return (
                <div
                  key={seg.id}
                  onClick={() => setSelectedSegmentId(seg.id)}
                  className={`p-5 rounded-2xl cursor-pointer transition-all border space-y-3 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/40 glow-brand'
                      : 'border-white/10 glass-card hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm">{seg.name}</h3>
                      <span className="text-[10px] text-slate-400 font-mono">{seg.customerCount} Active Buyers</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-400 font-mono">₹{seg.totalRevenue.toLocaleString()}</div>
                      <span className="text-[10px] text-slate-500 font-mono">AOV: ₹{seg.avgOrderValue}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-white/5">
                    <span className="text-slate-400">Conversion: {seg.conversionRate}%</span>
                    <span className={seg.growthRate >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {seg.growthRate >= 0 ? '↑' : '↓'} {Math.abs(seg.growthRate)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Deep Segment Analytics & AI Campaign (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                    RFM Behavioral Profile
                  </span>
                  <h2 className="text-lg font-bold text-white">{selectedSegment.name}</h2>
                </div>
                <div className="flex items-center space-x-3 text-xs font-mono">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">Purchase Intent</span>
                    <div className="font-bold text-cyan-400">{selectedSegment.purchaseIntentScore}/100</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400">Churn Risk</span>
                    <div className={`font-bold ${selectedSegment.churnRiskScore > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {selectedSegment.churnRiskScore}/100
                    </div>
                  </div>
                </div>
              </div>

              {/* Segment Characteristics */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold font-mono text-slate-300 uppercase">Cohort Behavior & Patterns</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {selectedSegment.characteristics.map((char, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-surface/70 border border-white/5 text-xs text-slate-300 flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                      <span>{char}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Strategic Action Proposal */}
              <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-brand-accent" />
                  <h3 className="font-bold text-white text-sm">Targeted AI Campaign Recommendation</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{selectedSegment.aiActionProposal}</p>
                <div className="flex justify-end pt-1">
                  <Link
                    href="/merchant/growth"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md"
                  >
                    <span>Deploy Campaign in Growth Hub</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
