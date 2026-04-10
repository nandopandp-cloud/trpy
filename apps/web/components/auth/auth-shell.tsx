'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useMediaImages } from '@/components/integrations/media';
import { cn } from '@/lib/utils';

// ─── Curated destinations — each one evokes a different travel fantasy ───────
// We rotate through these to give the user a glimpse of possibilities.
const DESTINATIONS = [
  { query: 'santorini greece sunset aerial', label: 'Santorini', country: 'Grécia' },
  { query: 'kyoto japan cherry blossom temple', label: 'Kyoto', country: 'Japão' },
  { query: 'machu picchu peru mountains', label: 'Machu Picchu', country: 'Peru' },
  { query: 'bali indonesia rice terraces', label: 'Ubud', country: 'Indonésia' },
  { query: 'iceland northern lights aurora', label: 'Reykjavík', country: 'Islândia' },
  { query: 'maldives overwater bungalow ocean', label: 'Maldivas', country: 'Oceano Índico' },
] as const;

// ─── Cinematic Shell ─────────────────────────────────────────────────────────

export function AuthShell({ children }: { children: React.ReactNode }) {
  const [index, setIndex] = useState(0);

  // We fetch a small pool per destination and pick the first landscape image
  // that loaded successfully. React Query will cache these across mounts.
  const current = DESTINATIONS[index];
  const { data } = useMediaImages({
    query: current.query,
    perPage: 4,
    orientation: 'landscape',
  });

  // Preload next destination's image to avoid flicker on transition
  const next = DESTINATIONS[(index + 1) % DESTINATIONS.length];
  useMediaImages({ query: next.query, perPage: 4, orientation: 'landscape' });

  const imageUrl = data?.items?.[0]?.url ?? null;

  // Rotate destinations every ~8s for a slow, cinematic feel
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % DESTINATIONS.length);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">

      {/* ── BACKGROUND LAYER — rotating cinematic imagery ─────────────────── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="sync">
          {imageUrl && (
            <motion.div
              key={current.query}
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: {
                  opacity: { duration: 1.8, ease: [0.22, 1, 0.36, 1] },
                  scale: { duration: 9, ease: 'linear' },
                },
              }}
              exit={{ opacity: 0, transition: { duration: 1.6, ease: 'easeInOut' } }}
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

        {/* Fallback gradient while the first image loads */}
        {!imageUrl && (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-zinc-900" />
        )}

        {/* ── Cinematic overlays ─────────────────────────────────────────── */}
        {/* Base darkening */}
        <div className="absolute inset-0 bg-black/45" />
        {/* Vignette — edges darker than center */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.7)_100%)]" />
        {/* Bottom fade — ensures content readability */}
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black via-black/70 to-transparent" />
        {/* Top fade — keeps header visible */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-black/60 to-transparent" />
      </div>

      {/* ── FOREGROUND — layout ────────────────────────────────────────────── */}
      <div className="relative z-10 flex min-h-screen flex-col">

        {/* Brand header */}
        <header className="w-full px-6 md:px-10 pt-6 md:pt-8 flex items-center justify-between">
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
            <span className="text-lg font-bold tracking-tight text-white drop-shadow-sm">TRPY</span>
          </Link>

          {/* Destination chip — subtle location label */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current.query}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.6 }}
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-medium tracking-wider uppercase text-white/80">
                {current.label}, {current.country}
              </span>
            </motion.div>
          </AnimatePresence>
        </header>

        {/* Main content — hero text + auth card */}
        <main className="flex-1 flex flex-col justify-end md:justify-center px-5 md:px-10 pt-10 pb-8 md:py-12">
          <div className="max-w-6xl w-full mx-auto grid md:grid-cols-2 gap-8 md:gap-16 items-center">

            {/* ── LEFT — emotional headline (desktop only) ─────────────── */}
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
                  Planejamento inteligente
                </span>
              </motion.div>

              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-medium text-white tracking-tight leading-[0.95] mb-5">
                Sua próxima<br />
                jornada<br />
                <span className="italic font-light bg-gradient-to-r from-indigo-200 via-white to-amber-200 bg-clip-text text-transparent">
                  começa aqui.
                </span>
              </h1>

              <p className="text-base lg:text-lg text-white/70 font-light max-w-md leading-relaxed">
                Planeje, descubra e viva experiências inesquecíveis.<br />
                Do sonho ao embarque — tudo em um só lugar.
              </p>
            </motion.div>

            {/* ── RIGHT — glass auth card ────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="w-full md:max-w-md md:ml-auto"
            >
              {/* Mobile headline — shows above card on small screens */}
              <div className="md:hidden text-center mb-7">
                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-4xl font-medium text-white tracking-tight leading-[0.95] mb-3"
                >
                  Sua próxima<br />
                  jornada{' '}
                  <span className="italic font-light bg-gradient-to-r from-indigo-200 to-amber-200 bg-clip-text text-transparent">
                    começa aqui.
                  </span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-sm text-white/70 font-light max-w-xs mx-auto"
                >
                  Planeje, descubra e viva experiências inesquecíveis.
                </motion.p>
              </div>

              {/* Glass card */}
              <div className="relative rounded-[28px] bg-white/[0.07] backdrop-blur-2xl border border-white/15 shadow-2xl overflow-hidden">
                {/* Subtle inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
                <div className="relative p-6 sm:p-8">
                  {children}
                </div>
              </div>

              {/* Footer — legal + indicators */}
              <div className="flex items-center justify-between mt-5 px-2">
                <p className="text-[11px] text-white/45 leading-snug max-w-[220px]">
                  Ao continuar você concorda com nossos{' '}
                  <Link href="#" className="text-white/70 hover:text-white underline underline-offset-2">Termos</Link>.
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

// ─── Destination progress dots ───────────────────────────────────────────────

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
