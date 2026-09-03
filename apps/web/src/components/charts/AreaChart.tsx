'use client';

import React, { useState } from 'react';

interface DataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

interface AreaChartProps {
  data: DataPoint[];
  height?: number;
  color?: string; // hex or rgb
  secondaryColor?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  showGrid?: boolean;
  showPoints?: boolean;
}

export function AreaChart({
  data,
  height = 180,
  color = '#6366f1',
  secondaryColor = '#06b6d4',
  valuePrefix = '',
  valueSuffix = '',
  showGrid = true,
  showPoints = true
}: AreaChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-xs text-slate-500 rounded-xl bg-slate-900/40 border border-white/5"
        style={{ height }}
      >
        No chart data available
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const secondaryValues = data.map((d) => d.secondaryValue ?? 0);
  const allValues = data.some((d) => d.secondaryValue !== undefined)
    ? [...values, ...secondaryValues]
    : values;

  const min = Math.min(0, ...allValues);
  const max = Math.max(...allValues, 1);
  const range = max - min || 1;

  const width = 600;
  const paddingX = 24;
  const paddingY = 20;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const getX = (index: number) =>
    paddingX + (index / (data.length - 1 || 1)) * chartWidth;
  const getY = (val: number) =>
    height - paddingY - ((val - min) / range) * chartHeight;

  // Generate SVG path for primary value
  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`);
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${getX(data.length - 1)},${height - paddingY} L ${getX(0)},${height - paddingY} Z`;

  // Generate SVG path for secondary value if present
  const hasSecondary = data.some((d) => d.secondaryValue !== undefined);
  const secPoints = hasSecondary
    ? data.map((d, i) => `${getX(i)},${getY(d.secondaryValue || 0)}`)
    : [];
  const secLinePath = hasSecondary ? `M ${secPoints.join(' L ')}` : '';

  const id = React.useId().replace(/:/g, '');

  return (
    <div className="relative w-full select-none" style={{ height }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={`areaGrad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.45" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id={`lineGrad-${id}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={secondaryColor || color} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {showGrid && (
          <g className="opacity-15">
            {[0, 0.33, 0.66, 1].map((pct, i) => {
              const y = height - paddingY - pct * chartHeight;
              return (
                <line
                  key={i}
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              );
            })}
          </g>
        )}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#areaGrad-${id})`} />

        {/* Secondary line if any */}
        {hasSecondary && (
          <path
            d={secLinePath}
            fill="none"
            stroke={secondaryColor}
            strokeWidth="2"
            strokeDasharray="4 3"
            className="opacity-70"
          />
        )}

        {/* Primary Line */}
        <path
          d={linePath}
          fill="none"
          stroke={`url(#lineGrad-${id})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive points & hover line */}
        {showPoints &&
          data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.value);
            const isHovered = hoverIndex === i;

            return (
              <g key={i}>
                {/* Vertical hover guide */}
                {isHovered && (
                  <line
                    x1={cx}
                    y1={paddingY}
                    x2={cx}
                    y2={height - paddingY}
                    stroke="#ffffff"
                    strokeOpacity="0.25"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}
                {/* Visible dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 5 : 3.5}
                  fill={isHovered ? '#ffffff' : color}
                  stroke="#090D16"
                  strokeWidth="2"
                  className="transition-all duration-150"
                />
                {/* Invisible hover trigger */}
                <rect
                  x={cx - chartWidth / (data.length * 2)}
                  y={0}
                  width={chartWidth / data.length}
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
          className="absolute pointer-events-none z-20 px-2.5 py-1.5 rounded-lg bg-slate-900/95 border border-indigo-500/50 shadow-xl backdrop-blur-md text-[11px] font-mono transform -translate-x-1/2 -translate-y-full transition-all duration-75"
          style={{
            left: `${((getX(hoverIndex) - paddingX) / chartWidth) * 100}%`,
            top: `${getY(data[hoverIndex].value) - 10}px`
          }}
        >
          <div className="text-slate-400 text-[10px]">
            {data[hoverIndex].label}
          </div>
          <div className="font-bold text-white flex items-center space-x-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: color }}
            />
            <span>
              {valuePrefix}
              {data[hoverIndex].value.toLocaleString()}
              {valueSuffix}
            </span>
          </div>
          {data[hoverIndex].secondaryValue !== undefined && (
            <div className="text-cyan-300 text-[10px] flex items-center space-x-1.5 mt-0.5">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: secondaryColor }}
              />
              <span>
                {valuePrefix}
                {data[hoverIndex].secondaryValue?.toLocaleString()}
                {valueSuffix}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
