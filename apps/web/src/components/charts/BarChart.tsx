'use client';

import React, { useState } from 'react';

interface BarPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  highlight?: boolean;
}

interface BarChartProps {
  data: BarPoint[];
  height?: number;
  color?: string;
  secondaryColor?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  layout?: 'vertical' | 'horizontal';
}

export function BarChart({
  data,
  height = 180,
  color = '#6366f1',
  secondaryColor = '#06b6d4',
  valuePrefix = '',
  valueSuffix = '',
  layout = 'vertical'
}: BarChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs text-slate-500 rounded-xl bg-slate-900/40 border border-white/5"
        style={{ height }}
      >
        No chart data
      </div>
    );
  }

  const max = Math.max(
    ...data.map((d) => Math.max(d.value, d.secondaryValue ?? 0)),
    1
  );

  if (layout === 'horizontal') {
    return (
      <div className="space-y-2.5 w-full py-1">
        {data.map((item, idx) => {
          const pct = Math.min(100, Math.max(0, (item.value / max) * 100));
          const secPct =
            item.secondaryValue !== undefined
              ? Math.min(100, Math.max(0, (item.secondaryValue / max) * 100))
              : undefined;

          return (
            <div
              key={idx}
              className="space-y-1 group"
              onMouseEnter={() => setHoverIndex(idx)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300 text-[11px] truncate max-w-[180px]">
                  {item.label}
                </span>
                <span className="font-bold text-white text-[11px]">
                  {valuePrefix}
                  {item.value.toLocaleString()}
                  {valueSuffix}
                </span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden flex relative">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: item.highlight ? '#10b981' : color
                  }}
                />
                {secPct !== undefined && (
                  <div
                    className="h-full rounded-full opacity-60 transition-all duration-500 -ml-1"
                    style={{
                      width: `${secPct}%`,
                      backgroundColor: secondaryColor
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="relative w-full flex items-end justify-between gap-2 pt-6 px-2 select-none"
      style={{ height }}
    >
      {data.map((item, idx) => {
        const heightPct = Math.min(100, Math.max(8, (item.value / max) * 100));
        const isHovered = hoverIndex === idx;

        return (
          <div
            key={idx}
            className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
            onMouseEnter={() => setHoverIndex(idx)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            {/* Tooltip */}
            {isHovered && (
              <div className="absolute -top-7 z-20 px-2 py-1 rounded bg-slate-900 border border-indigo-500/50 shadow-lg text-[10px] font-mono text-white whitespace-nowrap">
                {valuePrefix}
                {item.value.toLocaleString()}
                {valueSuffix}
              </div>
            )}

            {/* Bar */}
            <div
              className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 ${
                item.highlight
                  ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                  : isHovered
                  ? 'bg-indigo-400 brightness-110 shadow-lg glow-brand'
                  : 'bg-indigo-500/80 group-hover:bg-indigo-500'
              }`}
              style={{ height: `${heightPct}%` }}
            />

            {/* Label */}
            <span className="text-[10px] font-mono text-slate-400 mt-2 truncate max-w-full">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
