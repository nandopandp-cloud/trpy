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
  showBrand?: boolean;
}

const sizeMap: Record<LogoSize, string> = {
  sm: 'w-6 h-6 sm:w-7 sm:h-7',
  md: 'w-8 h-8 sm:w-9 sm:h-9',
  lg: 'w-10 h-10 sm:w-12 sm:h-12',
};

const textSizeMap: Record<LogoSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg sm:text-xl',
};

export function Logo({
  variant = 'navbar',
  size = 'md',
  className,
  href = '/',
  hideText = false,
  showBrand = false,
}: LogoProps) {
  const content = (
    <div className={cn(
      'flex items-center gap-2 shrink-0 group',
      showBrand && 'flex-col',
      className,
    )}>
      {/* Icon/Logo SVG - Premium vectorized TRPY */}
      <div className={cn('relative flex-shrink-0', sizeMap[size])}>
        <svg
          viewBox="0 0 450 280"
          className="w-full h-full drop-shadow-sm"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Gradient for T (Purple to Magenta) */}
            <linearGradient id="gradientT" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#c855f7', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#d946ef', stopOpacity: 1 }} />
            </linearGradient>

            {/* Gradient for R top (Purple to Blue) */}
            <linearGradient id="gradientRTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#1e40af', stopOpacity: 1 }} />
            </linearGradient>

            {/* Gradient for R bottom (Purple) */}
            <linearGradient id="gradientRBottom" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#7c3aed', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
            </linearGradient>

            {/* Gradient for P (Cyan to Blue) */}
            <linearGradient id="gradientP" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#0ea5e9', stopOpacity: 1 }} />
            </linearGradient>

            {/* Gradient for Y (Orange to Yellow) */}
            <linearGradient id="gradientYLeft" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
            </linearGradient>

            {/* Gradient for Y right (Orange to Red-Orange) */}
            <linearGradient id="gradientYRight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#fb923c', stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          {/* T: Horizontal bar + vertical stem */}
          <g>
            <rect x="65" y="55" width="95" height="32" rx="16" ry="16" fill="url(#gradientT)" />
            <path d="M 85 87 L 85 175 Q 85 185 95 185 L 95 185 Q 105 185 105 175 L 105 87 Z" fill="url(#gradientT)" />
          </g>

          {/* R: Vertical stem + curved bump + diagonal leg */}
          <g>
            <path d="M 155 55 L 155 180 Q 155 190 165 190 L 165 190 Q 175 190 175 180 L 175 55 Q 175 45 165 45 L 165 45 Q 155 45 155 55 Z" fill="url(#gradientRBottom)" />
            <path d="M 175 65 Q 240 65 250 110 Q 250 150 175 150 Q 165 150 165 140 L 165 75 Q 165 65 175 65 Z" fill="url(#gradientRTop)" />
            <path d="M 215 145 Q 270 160 310 215 Q 315 222 305 230 Q 250 175 215 160 Z" fill="url(#gradientRTop)" />
          </g>

          {/* P: Vertical stem + rounded bump top */}
          <g>
            <path d="M 260 85 L 260 190 Q 260 195 270 195 L 270 195 Q 280 195 280 190 L 280 85 Q 280 80 270 80 L 270 80 Q 260 80 260 85 Z" fill="url(#gradientP)" />
            <ellipse cx="315" cy="115" rx="60" ry="50" fill="url(#gradientP)" />
          </g>

          {/* Y: Two upper curves + vertical stem */}
          <g>
            <path d="M 320 65 Q 325 85 335 110 Q 340 118 330 125 Q 325 118 320 100 Q 315 85 312 70 Z" fill="url(#gradientYLeft)" />
            <path d="M 370 65 Q 365 85 355 110 Q 350 118 360 125 Q 365 118 370 100 Q 375 85 378 70 Z" fill="url(#gradientYRight)" />
            <path d="M 330 115 L 330 180 Q 330 190 340 190 L 340 190 Q 350 190 350 180 L 350 115 Q 350 105 340 105 L 340 105 Q 330 105 330 115 Z" fill="url(#gradientYLeft)" />
            <path d="M 350 115 Q 370 130 380 160 Q 382 175 370 178 Q 355 150 350 125 Z" fill="url(#gradientYRight)" />
          </g>

          {/* Connector lines */}
          <g opacity="0.2">
            <path d="M 280 140 Q 300 145 320 150" stroke="url(#gradientP)" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      {/* Text - TRPY with gradient */}
      {!hideText && variant !== 'icon-only' && (
        <span className={cn(
          'font-bold tracking-tight bg-gradient-to-r from-purple-500 via-cyan-500 to-orange-500 bg-clip-text text-transparent',
          textSizeMap[size],
        )}>
          TRPY
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group transition-transform hover:scale-105 active:scale-95">
        {content}
      </Link>
    );
  }

  return content;
}
