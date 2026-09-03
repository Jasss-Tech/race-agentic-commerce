'use client';

import React, { useState } from 'react';

interface ForecastBandPoint {
  label: string;
  actual?: number;
  predicted: number;
  lowerBound: number;
  upperBound: number;
}

interface ForecastBandsChartProps {
  data: ForecastBandPoint[];
  height?: number;
  valuePrefix?: string;
  valueSuffix?: string;
  title?: string;
}

export function ForecastBandsChart({
  data,
  height = 200,
  valuePrefix = '',
  valueSuffix = '',
  title = '30-Day Autoregressive Demand & Revenue Forecast'
}: ForecastBandsChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-xs text-slate-500 rounded-xl bg-slate-900/40" style={{ height }}>
        No forecast data
      </div>
    );
  }

  const allVals = data.flatMap((d) => [d.actual ?? d.predicted, d.predicted, d.lowerBound, d.upperBound]);
  const min = Math.max(0, Math.min(...allVals) * 0.85);
  const max = Math.max(...allVals) * 1.1;
  const range = max - min || 1;

  const width = 600;
  const padX = 32;
  const padY = 24;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const getX = (idx: number) => padX + (idx / (data.length - 1 || 1)) * chartW;
  const getY = (val: number) => height - padY - ((val - min) / range) * chartH;

  // Upper & Lower Confidence Area
  const upperPoints = data.map((d, i) => `${getX(i)},${getY(d.upperBound)}`);
  const lowerPoints = data.map((d, i) => `${getX(i)},${getY(d.lowerBound)}`).reverse();
  const confidenceAreaPath = `M ${upperPoints.join(' L ')} L ${lowerPoints.join(' L ')} Z`;

  // Predicted Line
  const predictedPath = `M ${data.map((d, i) => `${getX(i)},${getY(d.predicted)}`).join(' L ')}`;

  // Actual Line (if provided for past segments)
  const actualData = data.filter((d) => d.actual !== undefined);
  const actualPath =
    actualData.length > 1
      ? `M ${actualData.map((d) => `${getX(data.indexOf(d))},${getY(d.actual!)}`).join(' L ')}`
      : '';

  return (
    <div className="space-y-2 select-none">
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="font-bold text-slate-300">{title}</span>
        <div className="flex items-center space-x-3 text-[10px]">
          <span className="flex items-center space-x-1 text-indigo-400">
            <span className="w-2.5 h-0.5 bg-indigo-400 inline-block" />
            <span>Projected Line</span>
          </span>
          <span className="flex items-center space-x-1 text-indigo-300/60">
            <span className="w-2.5 h-2 bg-indigo-500/20 border border-indigo-500/40 inline-block rounded-xs" />
            <span>90% Confidence Interval</span>
          </span>
        </div>
      </div>

      <div className="relative w-full" style={{ height }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="forecastBandGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <g className="opacity-10">
            {[0, 0.5, 1].map((pct, i) => {
              const y = height - padY - pct * chartH;
              return (
                <line
                  key={i}
                  x1={padX}
                  y1={y}
                  x2={width - padX}
                  y2={y}
                  stroke="#ffffff"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              );
            })}
          </g>

          {/* Confidence Band Area */}
          <path d={confidenceAreaPath} fill="url(#forecastBandGrad)" />
          <path
            d={`M ${upperPoints.join(' L ')}`}
            fill="none"
            stroke="#818cf8"
            strokeWidth="1"
            strokeDasharray="3 3"
            className="opacity-40"
          />
          <path
            d={`M ${data.map((d, i) => `${getX(i)},${getY(d.lowerBound)}`).join(' L ')}`}
            fill="none"
            stroke="#818cf8"
            strokeWidth="1"
            strokeDasharray="3 3"
            className="opacity-40"
          />

          {/* Predicted Curve */}
          <path
            d={predictedPath}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Actual Curve if present */}
          {actualPath && (
            <path
              d={actualPath}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}

          {/* Interactive dots & hover targets */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.predicted);
            const isHovered = hoverIndex === i;

            return (
              <g key={i}>
                {isHovered && (
                  <line
                    x1={cx}
                    y1={padY}
                    x2={cx}
                    y2={height - padY}
                    stroke="#ffffff"
                    strokeOpacity="0.25"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5 : 3.5}
                  fill={isHovered ? '#ffffff' : '#6366f1'}
                  stroke="#090D16"
                  strokeWidth="2"
                  className="transition-all"
                />
                <rect
                  x={cx - chartW / (data.length * 2)}
                  y={0}
                  width={chartW / data.length}
                  height={height}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIndex(i)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoverIndex !== null && data[hoverIndex] && (
          <div
            className="absolute pointer-events-none z-20 px-3 py-2 rounded-xl bg-slate-900/95 border border-indigo-500/50 shadow-xl backdrop-blur-md text-[11px] font-mono transform -translate-x-1/2 -translate-y-full transition-all duration-75 space-y-0.5"
            style={{
              left: `${((getX(hoverIndex) - padX) / chartW) * 100}%`,
              top: `${getY(data[hoverIndex].predicted) - 12}px`
            }}
          >
            <div className="text-slate-400 text-[10px]">{data[hoverIndex].label}</div>
            <div className="font-bold text-white flex items-center space-x-1.5">
              <span>Expected:</span>
              <span className="text-indigo-400">
                {valuePrefix}
                {data[hoverIndex].predicted.toLocaleString()}
                {valueSuffix}
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              Range: {valuePrefix}{data[hoverIndex].lowerBound.toLocaleString()} – {valuePrefix}{data[hoverIndex].upperBound.toLocaleString()}{valueSuffix}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
