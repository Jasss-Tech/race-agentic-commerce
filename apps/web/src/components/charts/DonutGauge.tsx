'use client';

import React from 'react';

interface DonutGaugeProps {
  score: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  colorMap?: {
    optimal?: string;
    healthy?: string;
    warning?: string;
    critical?: string;
  };
}

export function DonutGauge({
  score,
  size = 140,
  strokeWidth = 12,
  label,
  sublabel,
  colorMap = {
    optimal: '#10b981', // emerald
    healthy: '#6366f1', // indigo
    warning: '#f59e0b', // amber
    critical: '#ef4444' // red
  }
}: DonutGaugeProps) {
  const clampedScore = Math.min(100, Math.max(0, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let activeColor = colorMap.healthy;
  if (clampedScore >= 90) activeColor = colorMap.optimal;
  else if (clampedScore >= 75) activeColor = colorMap.healthy;
  else if (clampedScore >= 50) activeColor = colorMap.warning;
  else activeColor = colorMap.critical;

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={activeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
            {clampedScore}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 -mt-1">
            /100
          </span>
        </div>
      </div>

      {(label || sublabel) && (
        <div className="text-center mt-2 space-y-0.5">
          {label && <div className="text-xs font-bold text-slate-200">{label}</div>}
          {sublabel && <div className="text-[10px] text-slate-400 font-mono">{sublabel}</div>}
        </div>
      )}
    </div>
  );
}
