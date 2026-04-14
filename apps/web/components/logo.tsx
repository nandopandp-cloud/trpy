'use client';

import Link from 'next/link';
import Image from 'next/image';
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

const sizeMap: Record<LogoSize, { icon: number; text: string }> = {
  sm: { icon: 32, text: 'text-sm' },
  md: { icon: 40, text: 'text-base' },
  lg: { icon: 48, text: 'text-lg sm:text-xl' },
};

export function Logo({
  variant = 'navbar',
  size = 'md',
  className,
  href = '/',
  hideText = true,
}: LogoProps) {
  const { icon: iconSize, text: textSize } = sizeMap[size];

  const content = (
    <div className={cn(
      'flex items-center gap-2 shrink-0 group',
      className,
    )}>
      {/* Logo Image */}
      <div className="relative flex-shrink-0" style={{ width: iconSize, height: iconSize }}>
        <img
          src="/logos/logo.png"
          alt="TRPY Logo"
          className="w-full h-full object-contain"
          loading="eager"
        />
      </div>

      {/* Text */}
      {!hideText && variant !== 'icon-only' && (
        <span className={cn(
          'font-bold tracking-tight text-foreground',
          textSize,
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
