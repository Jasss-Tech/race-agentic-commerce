'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
        // Legacy variants preserved for existing pages
        brand: 'border-primary/30 bg-primary/15 text-primary',
        emerald: 'border-success/40 bg-success/15 text-success',
        success: 'border-success/40 bg-success/15 text-success',
        amber: 'border-warning/40 bg-warning/15 text-warning',
        warning: 'border-warning/40 bg-warning/15 text-warning',
        rose: 'border-destructive/40 bg-destructive/15 text-destructive',
        danger: 'border-destructive/40 bg-destructive/15 text-destructive',
        cyan: 'border-signal-telemetry/40 bg-signal-telemetry/15 text-signal-telemetry',
        slate: 'border-border bg-muted text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Renders a pulsing status dot in the variant color */
  dot?: boolean;
}

const dotColor: Record<string, string> = {
  default: 'bg-primary-foreground',
  secondary: 'bg-secondary-foreground',
  destructive: 'bg-destructive-foreground',
  outline: 'bg-foreground',
  brand: 'bg-primary',
  emerald: 'bg-success',
  success: 'bg-success',
  amber: 'bg-warning',
  warning: 'bg-warning',
  rose: 'bg-destructive',
  danger: 'bg-destructive',
  cyan: 'bg-signal-telemetry',
  slate: 'bg-muted-foreground',
};

function Badge({ className, variant, dot = false, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full animate-pulse', dotColor[variant ?? 'default'])} />}
      <span>{children}</span>
    </span>
  );
}

export { Badge, badgeVariants };

export function SeverityBadge({ severity }: { severity: 'CRITICAL' | 'WARNING' | 'OPPORTUNITY' | 'INFO' }) {
  if (severity === 'CRITICAL') {
    return <Badge variant="rose" dot>CRITICAL</Badge>;
  }
  if (severity === 'WARNING') {
    return <Badge variant="amber" dot>WARNING</Badge>;
  }
  if (severity === 'OPPORTUNITY') {
    return <Badge variant="emerald" dot>OPPORTUNITY</Badge>;
  }
  return <Badge variant="cyan">INFO</Badge>;
}

export function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  const variant = pct >= 90 ? 'emerald' : pct >= 75 ? 'cyan' : 'amber';
  return <Badge variant={variant}>{pct}% Confidence</Badge>;
}
