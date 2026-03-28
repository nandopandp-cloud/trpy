import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface CardModernProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  gradient?: boolean;
}

export function CardModern({ className, hover = true, gradient = false, ...props }: CardModernProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card text-card-foreground',
        'transition-all duration-300',
        hover && 'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.01]',
        gradient && 'bg-gradient-to-br from-card to-muted/50',
        className
      )}
      {...props}
    />
  );
}
