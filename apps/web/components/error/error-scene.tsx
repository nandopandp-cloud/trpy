'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RefreshCw, Home, Compass, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale, t } from '@/lib/i18n';

/* ── Types ──────────────────────────────────────────────── */

type ErrorVariant = 'not-found' | 'server-error' | 'network' | 'empty';

interface ErrorSceneProps {
  variant?: ErrorVariant;
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
  showBack?: boolean;
  showHome?: boolean;
  showExplore?: boolean;
}

/* ── Icon per variant ──────────────────────────────────── */

const VARIANT_ICONS: Record<ErrorVariant, string> = {
  'not-found': '🧭',
  'server-error': '✈️',
  network: '🌧️',
  empty: '🗺️',
};

/* ── Floating particle ──────────────────────────────────── */

function Particle({ delay, size, x, duration }: { delay: number; size: number; x: number; duration: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-white/[0.06] dark:bg-white/[0.04]"
      style={{ width: size, height: size, left: `${x}%` }}
      initial={{ y: '110vh', opacity: 0 }}
      animate={{ y: '-10vh', opacity: [0, 0.8, 0.8, 0] }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

/* ── Animated SVG plane ─────────────────────────────────── */

function FloatingPlane() {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5 text-white/20 dark:text-white/15"
      animate={{
        x: [0, 6, 0, -6, 0],
        y: [0, -4, 0, -4, 0],
        rotate: [0, 3, 0, -3, 0],
      }}
      transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
    >
      <path
        d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
        fill="currentColor"
      />
    </motion.svg>
  );
}

/* ── Scene ──────────────────────────────────────────────── */

export function ErrorScene({
  variant = 'server-error',
  title,
  subtitle,
  onRetry,
  showBack = true,
  showHome = true,
  showExplore = true,
}: ErrorSceneProps) {
  const router = useRouter();
  const [locale] = useLocale();

  const VARIANTS: Record<
    ErrorVariant,
    { icon: string; title: string; subtitle: string }
  > = {
    'not-found': {
      icon: VARIANT_ICONS['not-found'],
      title: t(locale, 'error.not_found'),
      subtitle: t(locale, 'error.not_found_desc'),
    },
    'server-error': {
      icon: VARIANT_ICONS['server-error'],
      title: t(locale, 'error.server'),
      subtitle: t(locale, 'error.server_desc'),
    },
    network: {
      icon: VARIANT_ICONS.network,
      title: t(locale, 'error.network'),
      subtitle: t(locale, 'error.network_desc'),
    },
    empty: {
      icon: VARIANT_ICONS.empty,
      title: t(locale, 'error.empty'),
      subtitle: t(locale, 'error.empty_desc'),
    },
  };

  const copy = VARIANTS[variant];
  const displayTitle = title ?? copy.title;
  const displaySubtitle = subtitle ?? copy.subtitle;

  /* Generate stable random particles */
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        delay: (i * 1.3) % 8,
        size: 2 + Math.random() * 4,
        x: Math.random() * 100,
        duration: 12 + Math.random() * 10,
      })),
    [],
  );

  /* ── stagger children ── */
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } },
  };
  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden flex flex-col items-center justify-center px-6 py-12">

      {/* ── BG: animated gradient ────────────────────────── */}
      <div className="absolute inset-0 -z-10">
        {/* Base: subtle mesh gradient matching TRPY palette */}
        <div className="absolute inset-0 bg-background" />

        {/* Animated aurora blobs */}
        <motion.div
          className="absolute inset-0 opacity-70 dark:opacity-40"
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
          style={{
            backgroundSize: '300% 300%',
            backgroundImage:
              'radial-gradient(at 20% 30%, hsla(239,84%,67%,0.12) 0%, transparent 50%), ' +
              'radial-gradient(at 80% 20%, hsla(280,65%,60%,0.10) 0%, transparent 50%), ' +
              'radial-gradient(at 50% 80%, hsla(38,92%,50%,0.08) 0%, transparent 50%), ' +
              'radial-gradient(at 10% 70%, hsla(160,84%,44%,0.06) 0%, transparent 50%)',
          }}
        />

        {/* Radial vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,hsl(var(--background))_100%)]" />

        {/* Floating particles */}
        {particles.map((p) => (
          <Particle key={p.id} {...p} />
        ))}

        {/* Scattered floating planes */}
        <div className="absolute top-[15%] left-[12%]">
          <FloatingPlane />
        </div>
        <div className="absolute top-[35%] right-[18%] rotate-45">
          <FloatingPlane />
        </div>
        <div className="absolute bottom-[25%] left-[25%] -rotate-12">
          <FloatingPlane />
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center text-center max-w-md w-full"
      >
        {/* Icon badge */}
        <motion.div variants={item}>
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <div className="w-24 h-24 rounded-[2rem] bg-card/80 backdrop-blur-xl border border-border/60 shadow-card-lg flex items-center justify-center">
              <span className="text-5xl leading-none select-none">{copy.icon}</span>
            </div>
            {/* Soft glow behind icon */}
            <div className="absolute -inset-3 rounded-[2.5rem] bg-primary/5 blur-2xl -z-10" />
          </motion.div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={item}
          className="mt-8 text-display-sm md:text-display font-medium text-foreground tracking-tight leading-tight"
        >
          {displayTitle}
        </motion.h1>

        {/* Subtext */}
        <motion.p
          variants={item}
          className="mt-4 text-base text-muted-foreground font-light leading-relaxed max-w-sm"
        >
          {displaySubtitle}
        </motion.p>

        {/* Decorative divider */}
        <motion.div variants={item} className="mt-8 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-border" />
            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-border" />
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div variants={item} className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Primary CTA */}
          {onRetry && (
            <button
              onClick={onRetry}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-12 px-7 rounded-full bg-foreground text-background text-sm font-semibold shadow-sm hover:shadow-md hover:opacity-90 active:scale-95 transition-all"
            >
              <RefreshCw className="w-4 h-4 transition-transform group-hover:rotate-180 duration-500" />
              {t(locale, 'common.retry')}
            </button>
          )}

          {/* Secondary CTAs */}
          <div className="flex items-center gap-2.5">
            {showBack && (
              <button
                onClick={() => router.back()}
                className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-full border border-border bg-card/80 backdrop-blur-sm text-sm font-medium text-foreground hover:bg-muted hover:border-muted-foreground/20 active:scale-95 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                {t(locale, 'common.back')}
              </button>
            )}

            {showHome && (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-full border border-border bg-card/80 backdrop-blur-sm text-sm font-medium text-foreground hover:bg-muted hover:border-muted-foreground/20 active:scale-95 transition-all"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">{t(locale, 'nav.inicio')}</span>
              </Link>
            )}

            {showExplore && (
              <Link
                href="/dashboard/destinations"
                className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-full border border-border bg-card/80 backdrop-blur-sm text-sm font-medium text-foreground hover:bg-muted hover:border-muted-foreground/20 active:scale-95 transition-all"
              >
                <Compass className="w-4 h-4" />
                <span className="hidden sm:inline">{t(locale, 'error.explore')}</span>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Tiny TRPY branding */}
        <motion.p
          variants={item}
          className="mt-12 text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground/40 select-none"
        >
          TRPY
        </motion.p>
      </motion.div>
    </div>
  );
}
