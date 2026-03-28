'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const colorMap = {
  blue: 'from-blue-500 to-purple-500',
  green: 'from-emerald-500 to-teal-500',
  amber: 'from-amber-400 to-orange-500',
  red: 'from-red-500 to-rose-500',
} as const;

interface GradientProgressProps {
  value: number;
  max?: number;
  color?: keyof typeof colorMap;
  label?: string;
  showPercent?: boolean;
  className?: string;
}

export function GradientProgress({
  value,
  max = 100,
  color = 'blue',
  label,
  showPercent = true,
  className,
}: GradientProgressProps) {
  const percent = Math.min(Math.max((value / max) * 100, 0), 100);
  const barRef = useRef<HTMLDivElement>(null);

  // Animate on mount
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    bar.style.width = '0%';
    requestAnimationFrame(() => {
      bar.style.transition = 'width 600ms cubic-bezier(0.4, 0, 0.2, 1)';
      bar.style.width = `${percent}%`;
    });
  }, [percent]);

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-sm text-muted-foreground">{label}</span>}
          {showPercent && (
            <span className="text-xs font-medium text-foreground ml-auto">
              {Math.round(percent)}%
            </span>
          )}
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          ref={barRef}
          className={cn('h-full rounded-full bg-gradient-to-r', colorMap[color])}
          style={{ width: '0%' }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
