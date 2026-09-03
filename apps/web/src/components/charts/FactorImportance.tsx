'use client';

import React from 'react';

interface FactorItem {
  factor: string;
  weightPercent: number; // 0 to 100
  direction?: 'positive' | 'negative';
  description?: string;
}

interface FactorImportanceProps {
  factors: FactorItem[];
  title?: string;
}

export function FactorImportance({ factors, title = 'Explainable AI Factor Contribution' }: FactorImportanceProps) {
  return (
    <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-white/5 font-mono text-xs">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">{title}</span>
        <span className="text-[10px] text-indigo-400">SHAP / Gradient Decomposition</span>
      </div>

      <div className="space-y-2 pt-1">
        {factors.map((item, idx) => {
          const isPos = item.direction !== 'negative';
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-300 truncate max-w-[200px]">{item.factor}</span>
                <span className={`font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPos ? '+' : '-'}{item.weightPercent}%
                </span>
              </div>

              {/* Segmented / Smooth progress bar */}
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isPos
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-rose-500 to-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, item.weightPercent))}%` }}
                />
              </div>

              {item.description && (
                <div className="text-[10px] text-slate-500 font-sans">{item.description}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
