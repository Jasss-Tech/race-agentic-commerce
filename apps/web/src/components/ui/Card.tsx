'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** Legacy prop: 'glass' | 'elevated' | 'bordered' */
    variant?: 'glass' | 'elevated' | 'bordered';
    /** Legacy prop: 'brand' | 'cyan' | 'emerald' | 'amber' | 'red' | 'none' */
    glow?: 'brand' | 'cyan' | 'emerald' | 'amber' | 'red' | 'none';
  }
>(({ className, variant, glow = 'none', ...props }, ref) => {
  const variantClass =
    variant === 'elevated'
      ? 'glass-panel-elevated'
      : variant === 'bordered'
      ? 'bg-card/80 border border-border'
      : 'glass-card';

  const glowClass =
    glow === 'brand'
      ? 'glow-brand'
      : glow === 'cyan'
      ? 'glow-cyan'
      : glow === 'emerald'
      ? 'glow-emerald'
      : glow === 'amber'
      ? 'glow-amber'
      : glow === 'red'
      ? 'glow-red'
      : '';

  return (
    <div
      ref={ref}
      className={cn('rounded-lg border bg-card text-card-foreground p-5', variantClass, glowClass, className)}
      {...props}
    />
  );
});
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('font-display text-lg font-bold leading-none tracking-tight', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('pt-2', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center pt-2', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeText?: string;
  trend?: 'up' | 'down' | 'flat';
  subtitle?: string;
  icon?: React.ReactNode;
  chart?: React.ReactNode;
  className?: string;
}

function MetricCard({
  title,
  value,
  change,
  changeText: changeTextProp,
  trend: trendProp,
  subtitle,
  icon,
  chart,
  className
}: MetricCardProps) {
  const changeText = changeTextProp ?? (change !== undefined ? `${Math.abs(change)}%` : undefined);
  const trend = trendProp ?? (change !== undefined ? (change > 0 ? 'up' : change < 0 ? 'down' : 'flat') : 'up');
  return (
    <Card className={cn('flex flex-col justify-between space-y-3', className)}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        {icon && <div className="text-primary">{icon}</div>}
      </div>

      <div className="flex items-baseline justify-between">
        <div className="font-mono text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          {value}
        </div>
        {changeText && (
          <span
            className={cn(
              'flex items-center gap-0.5 font-mono text-xs font-bold',
              trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            <span>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}</span>
            <span>{changeText}</span>
          </span>
        )}
      </div>

      {(subtitle || chart) && (
        <div className="flex items-center justify-between border-t border-border pt-1 text-[11px] text-muted-foreground">
          {subtitle && <span>{subtitle}</span>}
          {chart && <div>{chart}</div>}
        </div>
      )}
    </Card>
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, MetricCard };
