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
      {/* Icon/Logo SVG */}
      <div className={cn('relative flex-shrink-0', sizeMap[size])}>
        <svg
          viewBox="0 0 400 280"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Main gradient: Purple → Magenta (for T, R, P) */}
            <linearGradient id="purpleMagenta" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#d946ef', stopOpacity: 1 }} />
            </linearGradient>

            {/* Cyan gradient (for R) */}
            <linearGradient id="cyanBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#0084d4', stopOpacity: 1 }} />
            </linearGradient>

            {/* Orange to Yellow gradient (for Y) */}
            <linearGradient id="orangeYellow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#f59e0b', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#fbbf24', stopOpacity: 1 }} />
            </linearGradient>

            {/* Red to Orange gradient (for Y bottom curve) */}
            <linearGradient id="redOrange" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#f97316', stopOpacity: 1 }} />
            </linearGradient>
          </defs>

          {/* T: Purple rounded cross shape */}
          <g>
            {/* Top bar */}
            <rect x="65" y="55" width="88" height="28" rx="14" ry="14" fill="url(#purpleMagenta)" />
            {/* Vertical stem */}
            <rect x="88" y="75" width="42" height="95" rx="21" ry="21" fill="url(#purpleMagenta)" />
          </g>

          {/* R: Purple stem with cyan bump and curl */}
          <g>
            {/* Main vertical stem (purple) */}
            <rect x="160" y="55" width="42" height="115" rx="21" ry="21" fill="url(#purpleMagenta)" />

            {/* Rounded bump right (cyan gradient) */}
            <path d="M 202 75 Q 242 75 242 105 Q 242 135 202 135 Q 162 135 162 105 Q 162 75 202 75 Z" fill="url(#cyanBlue)" />

            {/* Diagonal leg down-right (cyan) */}
            <path d="M 202 130 Q 250 140 280 175 Q 285 182 275 190 Q 250 160 202 150 Z" fill="url(#cyanBlue)" />
          </g>

          {/* P: Cyan stem with purple rounded top */}
          <g>
            {/* Main vertical stem (cyan) */}
            <rect x="245" y="80" width="42" height="110" rx="21" ry="21" fill="url(#cyanBlue)" />

            {/* Rounded bump at top (purple) */}
            <ellipse cx="287" cy="105" rx="48" ry="40" fill="url(#purpleMagenta)" />
          </g>

          {/* Y: Orange/Red flowing curves connecting top */}
          <g>
            {/* Left upper curve (orange going down-right) */}
            <path d="M 315 85 Q 325 100 340 120 Q 345 128 340 135 Q 335 132 330 120 Q 320 102 310 92 Z" fill="url(#orangeYellow)" />

            {/* Main Y stem (yellow-orange) */}
            <rect x="315" y="125" width="40" height="85" rx="20" ry="20" fill="url(#orangeYellow)" />

            {/* Right upper curve (orange-red) */}
            <path d="M 355 85 Q 345 100 330 120 Q 325 128 330 135 Q 335 132 340 120 Q 350 102 360 92 Z" fill="url(#redOrange)" />

            {/* Right side accent (red-orange) */}
            <path d="M 360 90 Q 375 110 380 140 Q 378 152 365 148 Q 358 125 355 100 Z" fill="url(#redOrange)" />
          </g>

          {/* Optional: Smooth connecting flow lines for premium look */}
          <g opacity="0.3">
            {/* Flow from P to Y */}
            <path d="M 365 110 Q 370 115 380 120" stroke="url(#orangeYellow)" strokeWidth="3" strokeLinecap="round" />
          </g>
        </svg>
      </div>

      {/* Text */}
      {!hideText && variant !== 'icon-only' && (
        <span className={cn(
          'font-bold tracking-tight bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500 bg-clip-text text-transparent',
          textSizeMap[size],
        )}>
          TRPY
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="group transition-transform hover:scale-105">
        {content}
      </Link>
    );
  }

  return content;
}
