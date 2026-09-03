'use client';

import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  trend?: 'up' | 'down' | 'flat';
}

export function Sparkline({
  data,
  width = 72,
  height = 24,
  color,
  trend = 'up'
}: SparklineProps) {
  if (!data || data.length < 2) {
    return <div className="w-16 h-6 bg-white/5 rounded" />;
  }

  const resolvedColor =
    color ||
    (trend === 'up'
      ? '#10b981'
      : trend === 'down'
      ? '#ef4444'
      : '#94a3b8');

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;

  const points = data
    .map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible select-none inline-block">
      <polyline
        fill="none"
        stroke={resolvedColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
