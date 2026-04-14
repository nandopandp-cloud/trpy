'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

export type LogoVariant = 'navbar' | 'footer' | 'icon-only';
export type LogoSize = 'sm' | 'md' | 'lg';

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  className?: string;
  href?: string;
  hideText?: boolean;
}

const sizeMap: Record<LogoSize, string> = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
};

export function Logo({
  variant = 'navbar',
  size = 'md',
  className,
  href = '/',
  hideText = false,
}: LogoProps) {
  const content = (
    <div className={cn('flex items-center gap-2 shrink-0', className)}>
      {/* Icon */}
      <div className={cn('relative', sizeMap[size])}>
        <svg
          viewBox="0 0 24 24"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
        >
          <defs>
            {/* Modern gradient: Purple → Cyan → Magenta */}
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#d946ef', stopOpacity: 1 }} />
            </linearGradient>

            {/* Accent gradient: Orange → Yellow */}
            <linearGradient id="logoAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          {/* Stylized flowing TRPY shapes */}
          {/* T-like stem with cap */}
          <path
            d="M 4 4 L 8 4 Q 9 4 9 5 L 9 6 Q 9 7 8 7 L 7 7 L 7 12 Q 7 13 6 13 L 5 13 Q 4 13 4 12 L 4 7 L 3 7 Q 2 7 2 6 L 2 5 Q 2 4 3 4 Z"
            fill="url(#logoGradient)"
          />

          {/* R-like curved bump */}
          <path
            d="M 10 4 L 10 12 Q 10 13 9 13 L 8 13 Q 7 13 7 12 L 7 4 Q 7 3 8 3 L 10 3 Q 12.5 3 12.5 6 Q 12.5 8 11 8.5 L 13 12 Q 13.5 13 12.5 13 L 11.5 13 Q 10.5 13 10 11.5 L 8.5 8.5 Q 7 8.5 7 8 L 10 8 Q 12 8 12 6 Q 12 4 10 4 Z"
            fill="url(#logoGradient)"
            opacity="0.9"
          />

          {/* P-like petal */}
          <path
            d="M 14 4 L 14 12 Q 14 13 13 13 L 12 13 Q 11 13 11 12 L 11 4 Q 11 3 12 3 L 14 3 Q 16.5 3 16.5 6 Q 16.5 8.5 14 8.5 L 12 8.5 Q 11 8.5 11 7.5 L 14 7.5 Q 16 7.5 16 6 Q 16 4 14 4 Z"
            fill="url(#logoGradient)"
            opacity="0.85"
          />

          {/* Y-like curved shape (orange accent) */}
          <path
            d="M 17 3 L 18.5 7 L 18.5 12 Q 18.5 13 17.5 13 L 16.5 13 Q 15.5 13 15.5 12 L 15.5 7 L 14 3 Q 13.5 2 14.5 2 L 15.5 2 Q 16 2 16.5 3 L 18 6.5 L 19.5 3 Q 20 2 20.5 2 L 21.5 2 Q 22.5 2 22 3 L 20.5 7 L 20.5 12 Q 20.5 13 19.5 13 L 18.5 13 Q 17.5 13 17.5 12 L 17.5 7 Z"
            fill="url(#logoAccent)"
            opacity="0.9"
          />
        </svg>
      </div>

      {/* Text */}
      {!hideText && variant !== 'icon-only' && (
        <span
          className={cn(
            'font-bold tracking-tight text-foreground',
            size === 'sm' && 'text-sm',
            size === 'md' && 'text-base',
            size === 'lg' && 'text-lg sm:text-xl',
          )}
        >
          TRPY
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group">
        {content}
      </Link>
    );
  }

  return content;
}
