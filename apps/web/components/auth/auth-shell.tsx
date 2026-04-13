'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaImages } from '@/components/integrations/media';
import { cn } from '@/lib/utils';
import { useLocale, t } from '@/lib/i18n';

const DESTINATIONS = [
  { query: 'santorini greece sunset aerial travel', label: 'Santorini', country: 'Grécia' },
  { query: 'kyoto japan cherry blossom temple travel', label: 'Kyoto', country: 'Japão' },
  { query: 'machu picchu peru mountains mist', label: 'Machu Picchu', country: 'Peru' },
  { query: 'bali indonesia temple rice fields', label: 'Ubud', country: 'Indonésia' },
  { query: 'iceland waterfall northern lights', label: 'Islândia', country: 'Europa' },
  { query: 'maldives turquoise ocean bungalow', label: 'Maldivas', country: 'Oceano Índico' },
] as const;

export function AuthShell({ children }: { children: React.ReactNode }) {
  const [locale] = useLocale();
  const [index, setIndex] = useState(0);
  const current = DESTINATIONS[index];

  const { data } = useMediaImages({
    query: current.query,
    perPage: 4,
    orientation: 'landscape',
  });

  // Preload next destination
  const next = DESTINATIONS[(index + 1) % DESTINATIONS.length];
  useMediaImages({ query: next.query, perPage: 4, orientation: 'landscape' });

  const imageUrl = data?.items?.[0]?.url ?? null;

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % DESTINATIONS.length), 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">

      {/* ── BACKGROUND ────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="sync">
          {imageUrl && (
            <motion.div
              key={current.query}
              initial={{ opacity: 0, scale: 1.07 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: {
                  opacity: { duration: 1.8, ease: [0.22, 1, 0.36, 1] },
                  scale: { duration: 9, ease: 'linear' },
                },
              }}
              exit={{ opacity: 0, transition: { duration: 1.4, ease: 'easeInOut' } }}
              className="absolute inset-0"
            >
              <img
                src={imageUrl}
                alt={`${current.label}, ${current.country}`}
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {!imageUrl && (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-zinc-900" />
        )}

        {/* ── Mobile overlays: minimal top, heavy bottom so photo dominates ─ */}
        <div className="absolute inset-0 md:hidden bg-black/25" />
        {/* Very strong bottom-up fade — headline and buttons sit here */}
        <div className="absolute inset-x-0 bottom-0 h-[65%] md:hidden bg-gradient-to-t from-black via-black/90 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-36 md:hidden bg-gradient-to-b from-black/55 to-transparent" />

        {/* ── Desktop overlays ─────────────────────────────────────────────── */}
        <div className="absolute inset-0 hidden md:block bg-black/40" />
        <div className="absolute inset-0 hidden md:block bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.65)_100%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-2/3 hidden md:block bg-gradient-to-t from-black via-black/65 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-48 hidden md:block bg-gradient-to-b from-black/55 to-transparent" />
      </div>

      {/* ── FOREGROUND ────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex min-h-screen flex-col">

        {/* Header */}
        <header className="w-full px-5 md:px-10 pt-6 md:pt-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all group-hover:bg-white/15 group-hover:scale-105">
              <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none">
                <circle cx="12" cy="12" r="9.5" stroke="white" strokeWidth="1.5" opacity="0.7" />
                <path d="M 12 3.5 L 13.2 8.5 L 12 12 Z" fill="white" />
                <path d="M 20.5 12 L 15.5 13.2 L 12 12 Z" fill="white" />
                <path d="M 12 20.5 L 10.8 15.5 L 12 12 Z" fill="white" />
                <path d="M 3.5 12 L 8.5 10.8 L 12 12 Z" fill="white" />
                <circle cx="12" cy="12" r="1.5" fill="white" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight text-white drop-shadow-sm">TRPY</span>
          </Link>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.query}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium tracking-wider uppercase text-white/80">
                {current.label}
              </span>
            </motion.div>
          </AnimatePresence>
        </header>

        {/* ── UNIFIED LAYOUT: mobile headline (shown only on mobile) + shared content ── */}
        <main className="flex-1 flex flex-col justify-end md:justify-center px-5 md:px-10 pb-8 md:py-12">
          <div className="w-full md:max-w-6xl md:mx-auto md:grid md:grid-cols-2 md:gap-16 md:items-center">

            {/* LEFT col — desktop headline (hidden on mobile) */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="hidden md:block"
            >
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-pulse" />
                <span className="text-[11px] font-medium tracking-wider uppercase text-white/85">
                  {t(locale, 'auth.smart_planning' as any)}
                </span>
              </motion.div>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-medium text-white tracking-tight leading-[0.95] mb-5">
                {t(locale, 'auth.hero' as any).split(' ').slice(0, -1).join(' ')}<br />
                <span className="italic font-light bg-gradient-to-r from-indigo-200 via-white to-amber-200 bg-clip-text text-transparent">
                  {t(locale, 'auth.hero' as any).split(' ').slice(-1)[0]}
                </span>
              </h1>

              <p className="text-base lg:text-lg text-white/70 font-light max-w-md leading-relaxed">
                {t(locale, 'auth.hero_desc' as any)}
              </p>
            </motion.div>

            {/* RIGHT col — form area (full-width on mobile) */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
              className="w-full md:max-w-md md:ml-auto"
            >
              {/* Mobile: cinematic headline above form (no card) */}
              <div className="md:hidden mb-7">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={current.label}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.4 }}
                    className="text-[10px] font-semibold tracking-[0.22em] uppercase text-white/55 mb-3"
                  >
                    {t(locale, 'auth.destination_label' as any).replace('{country}', current.country)}
                  </motion.p>
                </AnimatePresence>
                <h1 className="text-[2.6rem] font-bold text-white tracking-tight leading-[1.04] mb-3">
                  {t(locale, 'auth.hero' as any)}
                </h1>
                <p className="text-[13px] text-white/60 font-light">
                  {t(locale, 'auth.hero_desc' as any)}
                </p>
              </div>

              {/* Mobile: no card — content floats directly over image */}
              <div className="md:hidden">
                {children}
              </div>

              {/* Desktop: glassmorphism card */}
              <div className="hidden md:block">
                <div className="relative rounded-[28px] bg-white/[0.07] backdrop-blur-2xl border border-white/15 shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
                  <div className="relative p-7 lg:p-8">
                    {children}
                  </div>
                </div>
              </div>

              {/* Footer: terms + dots */}
              <div className="flex items-center justify-between mt-4 md:mt-5 px-1">
                <p className="text-[10px] md:text-[11px] text-white/35 md:text-white/40 leading-snug max-w-[200px]">
                  Ao continuar, aceita os{' '}
                  <Link href="#" className="text-white/55 md:text-white/60 hover:text-white underline underline-offset-2">{t(locale, 'auth.terms' as any)}</Link>.
                </p>
                <DestinationDots current={index} total={DESTINATIONS.length} onSelect={setIndex} />
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

function DestinationDots({
  current,
  total,
  onSelect,
}: {
  current: number;
  total: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          aria-label={`Destino ${i + 1}`}
          className={cn(
            'h-1 rounded-full transition-all duration-500',
            i === current ? 'w-6 bg-white' : 'w-1 bg-white/30 hover:bg-white/50',
          )}
        />
      ))}
    </div>
  );
}
