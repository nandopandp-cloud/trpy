'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Plus, PlaneTakeoff, Wallet, CalendarDays,
  ArrowRight, ChevronRight, MapPin, Calendar,
  Globe, Compass, Flame, Star, TrendingUp, Target,
  Plane,
} from 'lucide-react';
import { useTrips } from '@/hooks/useTrips';
import { useDestinationPhoto } from '@/hooks/useDestinationPhoto';
import dynamic from 'next/dynamic';

const TripStories = dynamic(() => import('@/components/dashboard/trip-stories').then(m => m.TripStories), {
  loading: () => <div className="h-20 rounded-2xl bg-muted animate-pulse" />,
  ssr: false,
});
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { useLocale, formatNumber } from '@/lib/i18n';

/* ── Animated Counter ─────────────────────────────────── */

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [locale] = useLocale();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();
    const from = 0;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }, [value]);

  return (
    <span className="tabular-nums">
      {prefix}{formatNumber(locale, display)}{suffix}
    </span>
  );
}

/* ── SVG Countdown Ring ───────────────────────────────── */

function CountdownRing({ days, total = 30 }: { days: number; total?: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, 1 - days / total));
  const offset = circumference * (1 - progress);

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        {/* Track */}
        <circle cx="60" cy="60" r={radius} fill="none" strokeWidth="6"
          className="stroke-border/40" />
        {/* Progress */}
        <motion.circle
          cx="60" cy="60" r={radius} fill="none" strokeWidth="6"
          strokeLinecap="round"
          className="stroke-indigo-500"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
          style={{ strokeDasharray: circumference }}
        />
        {/* Glow */}
        <motion.circle
          cx="60" cy="60" r={radius} fill="none" strokeWidth="10"
          strokeLinecap="round"
          className="stroke-indigo-500/30"
          style={{ strokeDasharray: circumference, strokeDashoffset: offset, filter: 'blur(6px)' }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: 0.3 }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-foreground leading-none">
          <AnimatedNumber value={days} />
        </span>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-1">dias</span>
      </div>
    </div>
  );
}

/* ── Budget Gauge (half circle) ───────────────────────── */

function BudgetGauge({ spent, budget }: { spent: number; budget: number }) {
  const pct = budget > 0 ? Math.min(spent / budget, 1) : 0;
  const isWarning = pct > 0.8;

  return (
    <div className="relative w-full max-w-[180px] mx-auto">
      <svg viewBox="0 0 120 70" className="w-full">
        {/* Track */}
        <path
          d="M 10 65 A 50 50 0 0 1 110 65"
          fill="none" strokeWidth="8" strokeLinecap="round"
          className="stroke-border/30"
        />
        {/* Progress */}
        <motion.path
          d="M 10 65 A 50 50 0 0 1 110 65"
          fill="none" strokeWidth="8" strokeLinecap="round"
          className={isWarning ? 'stroke-amber-500' : 'stroke-emerald-500'}
          style={{ pathLength: 0 }}
          animate={{ pathLength: pct }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1], delay: 0.5 }}
        />
      </svg>
      {/* Center info */}
      <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
        <span className={cn('text-xl font-bold leading-none', isWarning ? 'text-amber-500' : 'text-emerald-500')}>
          {Math.round(pct * 100)}%
        </span>
        <span className="text-[9px] text-muted-foreground mt-0.5">utilizado</span>
      </div>
    </div>
  );
}

/* ── 3D Tilt Card ─────────────────────────────────────── */

function TiltCard({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 200, damping: 20 });

  function handleMouse(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div className="perspective-1000" onMouseMove={handleMouse} onMouseLeave={handleLeave}>
      <motion.div
        ref={ref}
        style={{ rotateX, rotateY }}
        onClick={onClick}
        className={cn('bento-card preserve-3d', className)}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ── Data ─────────────────────────────────────────────── */

const TRENDING_POOL = [
  { name: 'Bali', country: 'Indonésia', emoji: '🌊', gradient: 'from-emerald-500 to-teal-600', tag: 'Natureza', rating: 4.9, query: 'Bali travel landscape' },
  { name: 'Paris', country: 'França', emoji: '🗼', gradient: 'from-sky-500 to-indigo-600', tag: 'Cultura', rating: 4.8, query: 'Paris city skyline' },
  { name: 'Patagônia', country: 'Argentina', emoji: '🏔️', gradient: 'from-slate-500 to-slate-700', tag: 'Aventura', rating: 4.9, query: 'Patagonia mountains landscape' },
  { name: 'Tóquio', country: 'Japão', emoji: '🎌', gradient: 'from-rose-500 to-pink-600', tag: 'Urbano', rating: 4.8, query: 'Tokyo city night' },
  { name: 'Santorini', country: 'Grécia', emoji: '🏝️', gradient: 'from-blue-500 to-cyan-600', tag: 'Romance', rating: 4.7, query: 'Santorini Greece blue domes' },
  { name: 'Maldivas', country: 'Maldivas', emoji: '🏝️', gradient: 'from-cyan-500 to-blue-600', tag: 'Praia', rating: 4.9, query: 'Maldives resort tropical' },
  { name: 'Barcelona', country: 'Espanha', emoji: '🎨', gradient: 'from-red-500 to-yellow-500', tag: 'Arquitetura', rating: 4.8, query: 'Barcelona Gaudi city' },
  { name: 'Marrocos', country: 'Marrocos', emoji: '🕌', gradient: 'from-amber-600 to-orange-700', tag: 'Cultura', rating: 4.7, query: 'Morocco medina desert' },
  { name: 'Islândia', country: 'Islândia', emoji: '🌋', gradient: 'from-indigo-600 to-violet-700', tag: 'Natureza', rating: 4.9, query: 'Iceland waterfall glacier' },
  { name: 'Dubai', country: 'Emirados', emoji: '🏙️', gradient: 'from-amber-400 to-yellow-600', tag: 'Luxo', rating: 4.6, query: 'Dubai skyline desert' },
  { name: 'Nova York', country: 'EUA', emoji: '🗽', gradient: 'from-sky-600 to-blue-700', tag: 'Urbano', rating: 4.8, query: 'New York City lights' },
  { name: 'Tailândia', country: 'Tailândia', emoji: '🛕', gradient: 'from-orange-500 to-red-600', tag: 'Aventura', rating: 4.7, query: 'Thailand temple beach' },
  { name: 'Praga', country: 'República Tcheca', emoji: '🏰', gradient: 'from-red-600 to-rose-700', tag: 'História', rating: 4.8, query: 'Prague castle old town' },
];

function getRandomTrending(): typeof TRENDING_POOL {
  const shuffled = [...TRENDING_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 12);
}

const CATEGORIES = [
  { label: 'Praias', emoji: '🏖️', gradient: 'from-sky-400 to-cyan-500', desc: 'Mar, sol e areia', query: 'tropical beach ocean' },
  { label: 'Montanhas', emoji: '⛰️', gradient: 'from-emerald-500 to-green-700', desc: 'Trilhas e altitudes', query: 'mountain landscape trail' },
  { label: 'Cidades', emoji: '🏙️', gradient: 'from-violet-500 to-indigo-700', desc: 'Arte e arquitetura', query: 'city architecture skyline' },
  { label: 'Aventura', emoji: '🪂', gradient: 'from-amber-400 to-orange-600', desc: 'Adrenalina pura', query: 'adventure extreme sports' },
  { label: 'Gastronomia', emoji: '🍣', gradient: 'from-rose-500 to-red-600', desc: 'Culinária do mundo', query: 'gourmet food travel' },
  { label: 'Cultura', emoji: '🏛️', gradient: 'from-purple-500 to-violet-700', desc: 'História e tradição', query: 'historical architecture temple' },
  { label: 'Relax', emoji: '🧖', gradient: 'from-teal-400 to-cyan-600', desc: 'Spa e descanso', query: 'spa wellness resort' },
  { label: 'Família', emoji: '👨‍👩‍👧', gradient: 'from-pink-400 to-fuchsia-600', desc: 'Para toda família', query: 'family vacation fun travel' },
];

const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  PLANNING: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', dot: 'bg-indigo-500' },
  ONGOING: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', dot: 'bg-emerald-500' },
  COMPLETED: { bg: 'bg-zinc-500/10', text: 'text-zinc-500', dot: 'bg-zinc-500' },
  CANCELLED: { bg: 'bg-red-500/10', text: 'text-red-500', dot: 'bg-red-500' },
};

const STATUS_LABEL: Record<string, string> = {
  PLANNING: 'Planejando', ONGOING: 'Em andamento', COMPLETED: 'Concluída', CANCELLED: 'Cancelada',
};

const GRADIENT_FALLBACKS = [
  'from-indigo-600 via-violet-600 to-purple-700',
  'from-sky-600 via-blue-600 to-indigo-700',
  'from-emerald-600 via-teal-600 to-cyan-700',
  'from-amber-600 via-orange-500 to-red-600',
];

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.08 } } },
  item: { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { ease: [0.16, 1, 0.3, 1], duration: 0.5 } } },
};

/* ══════════════════════════════════════════════════════════ */
/* PAGE                                                      */
/* ══════════════════════════════════════════════════════════ */

export default function DashboardPage() {
  const [locale] = useLocale();
  const router = useRouter();
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(' ')[0] ?? 'viajante';
  const { data, isLoading } = useTrips({ limit: 5 });
  const trips = data?.trips ?? [];
  const TRENDING = useMemo(() => getRandomTrending(), []);

  const totalBudget = trips.reduce((s, t) => s + Number(t.budget), 0);
  const totalSpent  = trips.reduce((s, t) => s + Number(t.totalSpent), 0);
  const nextTrip    = trips.find(t => t.status === 'PLANNING' || t.status === 'ONGOING');
  const daysToNext  = nextTrip ? Math.max(0, differenceInDays(new Date(nextTrip.startDate), new Date())) : null;

  // Photo for "Próxima Viagem" card — use saved coverImage or fetch from media engine
  const tripPhotoFromEngine = useDestinationPhoto(
    nextTrip && !nextTrip.coverImage ? nextTrip.destination : null,
  );
  const tripPhoto = nextTrip?.coverImage ?? tripPhotoFromEngine;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">

      {/* ═══════════════════════════════════════════════════ */}
      {/* HERO — Immersive Greeting with Mesh Gradient       */}
      {/* ═══════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[2rem] min-h-[220px]"
      >
        {/* BG layers */}
        <div className="absolute inset-0 bg-muted/40 dark:bg-zinc-900" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-muted to-primary/5 dark:from-indigo-950/30 dark:via-zinc-900 dark:to-indigo-950/20" />
        <div className="absolute inset-0 bg-dot-grid opacity-[0.03] dark:opacity-[0.07]" />

        {/* Aurora blob */}
        <div className="absolute -top-20 -right-20 w-80 h-80 aurora opacity-40" />

        {/* Orbiting dot */}
        <div className="absolute top-1/2 left-1/3 w-2 h-2 rounded-full bg-indigo-400/60 animate-orbit" style={{ '--orbit-radius': '100px', '--orbit-duration': '12s' } as React.CSSProperties} />
        <div className="absolute top-1/2 left-2/3 w-1.5 h-1.5 rounded-full bg-purple-400/40 animate-orbit" style={{ '--orbit-radius': '60px', '--orbit-duration': '18s' } as React.CSSProperties} />

        {/* Conic spinner */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full animate-spin-slow opacity-[0.03]"
          style={{ background: 'conic-gradient(from 0deg, transparent 0deg, #6366f1 60deg, transparent 120deg)' }} />

        {/* Content */}
        <div className="relative z-10 px-8 md:px-12 py-10 md:py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1 min-w-0">
            <motion.p
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-[10px] font-mono mb-2 tracking-[0.2em] uppercase"
            >
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground leading-[1.1] tracking-tight"
            >
              Olá, {firstName}<span className="text-gradient-accent">.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-muted-foreground text-sm md:text-base font-light max-w-md mt-2"
            >
              {nextTrip
                ? <>Faltam <strong className="text-foreground font-medium">{daysToNext} dias</strong> para <strong className="text-foreground font-medium">{nextTrip.destination}</strong></>
                : 'Pronto para planejar sua próxima aventura?'}
            </motion.p>

            {/* Next trip pill */}
            {nextTrip && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                onClick={() => router.push(`/dashboard/trips/${nextTrip.id}`)}
                className="mt-5 inline-flex items-center gap-3 bg-muted/40 backdrop-blur-sm border border-border rounded-2xl px-4 py-3 cursor-pointer hover:bg-muted/60 transition-all group/pill"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 ring-1 ring-primary/20">
                  <Plane className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-foreground font-medium text-xs truncate">{nextTrip.title}</p>
                  <p className="text-muted-foreground text-[10px] truncate flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" />
                    {nextTrip.destination}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover/pill:text-foreground group-hover/pill:translate-x-0.5 transition-all" />
              </motion.div>
            )}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="shrink-0"
          >
            <div className="group relative">
              <div className="absolute -inset-2 rounded-full bg-primary/15 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
              <button
                onClick={() => router.push('/dashboard/trips/new')}
                className="group relative z-10 flex items-center overflow-hidden rounded-full p-[1.5px] bg-gradient-to-r from-primary/60 to-primary/40"
              >
                <span className="relative flex items-center rounded-full bg-card px-7 py-3.5 ring-1 ring-border">
                  <span className="absolute inset-0 overflow-hidden rounded-full">
                    <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
                  </span>
                  <Plus className="w-4 h-4 mr-2 text-primary relative z-10" />
                  <span className="relative z-10 text-sm font-medium tracking-wide text-foreground">Nova viagem</span>
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* STORIES                                            */}
      {/* ═══════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <TripStories trips={trips} />
      </motion.div>

      {/* ═══════════════════════════════════════════════════ */}
      {/* BENTO GRID — The Core Visual                       */}
      {/* ═══════════════════════════════════════════════════ */}
      {trips.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <div className="relative overflow-hidden rounded-[2rem] min-h-[360px] md:min-h-[420px] border border-border/40">
            {/* BG Aurora */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-zinc-900 to-purple-950/20" />
            <div className="absolute -top-40 -right-40 w-96 h-96 aurora opacity-30 pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 aurora opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(124,92,255,0.15), transparent)' }} />

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-8 md:px-12 py-16 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="w-20 h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6"
              >
                <Globe className="w-10 h-10 text-indigo-400" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3 max-w-2xl"
              >
                Comece a desbravar as maravilhas do mundo
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-base md:text-lg text-white/60 max-w-xl mb-8"
              >
                Crie sua primeira viagem e comece a planejar sua próxima aventura com a inteligência da IA ao seu lado.
              </motion.p>

              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/dashboard/trips/new')}
                className="group relative z-10 flex items-center overflow-hidden rounded-full p-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 shadow-xl shadow-indigo-500/30"
              >
                <span className="relative flex items-center rounded-full bg-zinc-900 px-8 py-3.5 ring-1 ring-border transition-all group-hover:bg-zinc-800">
                  <span className="absolute inset-0 overflow-hidden rounded-full">
                    <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
                  </span>
                  <span className="relative z-10 text-base font-semibold tracking-wide text-white">
                    Crie sua viagem agora
                  </span>
                  <ArrowRight className="w-5 h-5 ml-2 text-indigo-400 group-hover:translate-x-1 transition-transform relative z-10" />
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-max lg:auto-rows-[minmax(180px,auto)]"
        >
          {/* ── Card 1: Próxima Viagem — full-width mobile, 2×2 desktop ── */}
          <motion.div variants={stagger.item} className="col-span-2 lg:row-span-2">
          <TiltCard className="h-full p-5 flex flex-col justify-between">
            {/* ── Destination photo as elegant background ── */}
            {tripPhoto && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none"
                aria-hidden
              >
                <img
                  src={tripPhoto}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover scale-105"
                  style={{ opacity: 0.13 }}
                />
                {/* Fade: strong on left (text area), transparent on right */}
                <div className="absolute inset-0 bg-gradient-to-r from-card via-card/70 to-card/10" />
                {/* Bottom fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-card/40" />
              </motion.div>
            )}

            {/* Aurora blob (only when no photo) */}
            {!tripPhoto && (
              <div className="absolute -top-24 -right-24 w-64 h-64 aurora opacity-20 pointer-events-none" />
            )}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-card/80 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Próxima viagem</span>
            </div>

            {/* Body — horizontal on mobile, vertical on desktop */}
            <div className="relative z-10 flex-1 flex flex-row lg:flex-col items-center gap-4 lg:gap-0 lg:justify-center">
              {daysToNext !== null ? (
                <>
                  {/* Ring — smaller on mobile */}
                  <div className="shrink-0 scale-75 lg:scale-100 origin-center -my-4 lg:my-0">
                    <CountdownRing days={daysToNext} total={Math.max(daysToNext + 10, 30)} />
                  </div>
                  {/* Text — beside ring on mobile */}
                  <div className="lg:text-center lg:mt-3">
                    <p className="text-sm font-bold text-foreground leading-tight">{nextTrip?.destination}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{nextTrip?.title}</p>
                    {/* Stats inline on mobile */}
                    <div className="flex items-center gap-3 mt-3 lg:hidden">
                      <div>
                        <p className="text-base font-bold text-foreground leading-none">
                          <AnimatedNumber value={data?.total ?? 0} />
                        </p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">viagens</p>
                      </div>
                      <div className="w-px h-6 bg-border/40" />
                      <div>
                        <p className="text-base font-bold text-foreground leading-none">
                          {nextTrip && format(new Date(nextTrip.startDate), "d MMM", { locale: ptBR })}
                        </p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">partida</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center w-full">
                  <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-2">
                    <Globe className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-xs font-medium text-muted-foreground">Nenhuma viagem planejada</p>
                  <button
                    onClick={() => router.push('/dashboard/trips/new')}
                    className="mt-2 text-xs font-medium text-indigo-500 hover:text-indigo-400 transition-colors"
                  >
                    Criar primeira viagem →
                  </button>
                </div>
              )}
            </div>

            {/* Stats row — desktop only */}
            {nextTrip && (
              <div className="relative z-10 hidden lg:flex items-center gap-3 pt-3 border-t border-border/40">
                <div className="flex-1 text-center">
                  <p className="text-lg font-bold text-foreground leading-none">
                    <AnimatedNumber value={data?.total ?? 0} />
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">viagens</p>
                </div>
                <div className="w-px h-8 bg-border/40" />
                <div className="flex-1 text-center">
                  <p className="text-lg font-bold text-foreground leading-none">
                    {format(new Date(nextTrip.startDate), "d MMM", { locale: ptBR })}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">partida</p>
                </div>
              </div>
            )}
          </TiltCard>
        </motion.div>

        {/* ── Card 2: Budget Gauge (hidden if no trips) ── */}
        {trips.length > 0 && (
          <motion.div variants={stagger.item} className="col-span-1 row-span-1">
            <TiltCard className="h-full p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Wallet className="w-3 h-3 text-emerald-500" />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Orçamento</span>
              </div>

              <div className="flex-1 flex items-center justify-center py-1">
                {totalBudget > 0 ? (
                  <BudgetGauge spent={totalSpent} budget={totalBudget} />
                ) : (
                  <p className="text-xs text-muted-foreground text-center">Sem dados</p>
                )}
              </div>

              <div className="pt-1 flex justify-between text-[9px] text-muted-foreground">
                <span>R$ {formatNumber(locale, totalSpent)}</span>
                <span>R$ {formatNumber(locale, totalBudget)}</span>
              </div>
            </TiltCard>
          </motion.div>
        )}

        {/* ── Card 3: Total Trips ── */}
        <motion.div variants={stagger.item} className="col-span-1 row-span-1">
          <TiltCard className="h-full p-4 flex flex-col">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                <PlaneTakeoff className="w-3 h-3 text-indigo-500" />
              </div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Viagens</span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center py-2">
              <p className="text-4xl font-bold text-foreground leading-none tracking-tight">
                <AnimatedNumber value={data?.total ?? 0} />
              </p>
              <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
                {(data?.total ?? 0) === 1 ? 'viagem' : 'viagens'}<br />planejadas
              </p>
            </div>

            <div className="pt-2 border-t border-border/40">
              <div className="flex items-center justify-center gap-1.5">
                <div className="h-0.5 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-500/40" />
                <span className="text-[9px] text-muted-foreground font-medium">Planejadas</span>
                <div className="h-0.5 w-8 rounded-full bg-gradient-to-l from-indigo-500 to-indigo-500/40" />
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* ── Card 4: Gastos (hidden if no trips) — span 1 col on mobile, 2 on desktop ── */}
        {trips.length > 0 && (
          <motion.div variants={stagger.item} className="col-span-2 lg:col-span-2 row-span-1">
            <TiltCard className="h-full p-5">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Gastos &amp; Orçamento</span>
              </div>

              {/* Two-column layout: big number left, breakdown right */}
              <div className="flex items-end gap-6">
                {/* Left: spending amount */}
                <div className="shrink-0">
                  <p className="text-3xl font-bold text-foreground leading-none tracking-tight whitespace-nowrap">
                    R$ <AnimatedNumber value={totalSpent} />
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {totalBudget > 0
                      ? `${Math.round((totalSpent / totalBudget) * 100)}% do orçamento`
                      : 'total gasto'}
                  </p>
                </div>

                {/* Right: full progress breakdown */}
                {totalBudget > 0 && (
                  <div className="flex-1 space-y-1.5">
                    {/* Bar */}
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                      <span>Gasto</span>
                      <span className="whitespace-nowrap">R$ {formatNumber(locale, totalBudget)}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className={cn(
                          'h-full rounded-full relative overflow-hidden',
                          totalSpent > totalBudget * 0.9 ? 'bg-amber-500' : 'bg-indigo-500'
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
                        transition={{ duration: 1.2, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
                      >
                        {/* Shimmer */}
                        <span className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
                      </motion.div>
                    </div>
                    {/* Labels */}
                    <div className="flex items-center justify-between text-[10px] gap-2">
                      <span className={cn('font-semibold whitespace-nowrap', totalSpent > totalBudget * 0.9 ? 'text-amber-500' : 'text-indigo-500')}>
                        R$ {formatNumber(locale, totalSpent)} gasto
                      </span>
                      <span className="text-muted-foreground whitespace-nowrap">
                        R$ {formatNumber(locale, Math.max(0, totalBudget - totalSpent))} restante
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </TiltCard>
          </motion.div>
        )}

        </motion.div>
      )}

      {/* ═══════════════════════════════════════════════════ */}
      {/* EXPLORE — Category Grid                            */}
      {/* ═══════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground tracking-tight">Explorar por categoria</h2>
          </div>
          <Link href="/dashboard/destinations" className="text-xs text-primary font-medium hover:text-primary/80 transition-colors flex items-center gap-1">
            Ver todas <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-2.5 md:grid-cols-8">
          {CATEGORIES.map((cat, i) => (
            <CategoryBubble key={cat.label} cat={cat} delay={0.35 + i * 0.04} />
          ))}
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* TRENDING — Immersive Destination Cards w/ Photos   */}
      {/* ═══════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2.5">
          <Flame className="w-4 h-4 text-amber-500" />
          <h2 className="text-base font-semibold text-foreground tracking-tight">Em alta</h2>
          <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider border border-amber-500/20">
            Esta semana
          </span>
        </div>

        {/* First card prominent, rest in scrollable row */}
        <div className="space-y-3">
          <TrendingHeroCard dest={TRENDING[0]} delay={0.4} />

          {/* Remaining 4 — horizontal scroll */}
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            {TRENDING.slice(1).map((dest, i) => (
              <TrendingSmallCard key={dest.name} dest={dest} delay={0.45 + i * 0.07} />
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════ */}
      {/* RECENT TRIPS — Timeline Style                      */}
      {/* ═══════════════════════════════════════════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Target className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground tracking-tight">Viagens recentes</h2>
            {trips.length > 0 && (
              <span className="text-[10px] font-bold text-muted-foreground px-2 py-0.5 rounded-full bg-muted">{trips.length}</span>
            )}
          </div>
          <Link href="/dashboard/trips" className="text-xs text-primary font-medium hover:text-primary/80 transition-colors flex items-center gap-1">
            Ver todas <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card animate-pulse">
                <div className="w-14 h-14 rounded-xl bg-muted shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-2/3" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <EmptyDashboard onNew={() => router.push('/dashboard/trips/new')} />
        ) : (
          <div className="space-y-3">
            {trips.map((trip, i) => {
              const style = STATUS_STYLE[trip.status] ?? STATUS_STYLE.PLANNING;
              const fallback = GRADIENT_FALLBACKS[i % GRADIENT_FALLBACKS.length];
              const isActive = trip.status === 'ONGOING';

              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.06 }}
                  whileHover={{ x: 4 }}
                  onClick={() => router.push(`/dashboard/trips/${trip.id}`)}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm hover:bg-card hover:border-border hover:shadow-lg transition-all cursor-pointer group"
                >
                  {/* Thumbnail with gradient ring on active */}
                  <div className={cn(
                    'relative w-14 h-14 rounded-xl overflow-hidden shrink-0',
                    isActive && 'ring-2 ring-emerald-500/50'
                  )}>
                    {trip.coverImage ? (
                      <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center', fallback)}>
                        <Plane className="w-5 h-5 text-white/60" />
                      </div>
                    )}
                    {/* Active pulse */}
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground tracking-tight truncate">{trip.title}</h4>
                      <span className={cn(
                        'hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider shrink-0',
                        style.bg, style.text
                      )}>
                        {STATUS_LABEL[trip.status]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{trip.destination}</span>
                      <span className="text-border">·</span>
                      <Calendar className="w-3 h-3 shrink-0" />
                      {format(new Date(trip.startDate), "d MMM", { locale: ptBR })} — {format(new Date(trip.endDate), "d MMM", { locale: ptBR })}
                    </p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.section>

    </div>
  );
}

// ─── Trending card sub-components ────────────────────────────────────────────
// Each card calls its own useDestinationPhoto hook so React's rules-of-hooks
// are respected (no hook calls inside .map()).

interface TrendingDest {
  name: string;
  country: string;
  emoji: string;
  gradient: string;
  tag: string;
  rating: number;
  query: string;
}

function TrendingHeroCard({ dest, delay }: { dest: TrendingDest; delay: number }) {
  const router = useRouter();
  const photo = useDestinationPhoto(dest.query);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => router.push(`/dashboard/destinations/${encodeURIComponent(dest.name.toLowerCase())}`)}
      className="relative h-[200px] rounded-2xl overflow-hidden cursor-pointer group shadow-lg hover:shadow-2xl transition-shadow duration-500"
    >
      {/* Background: photo or gradient fallback */}
      {photo ? (
        <img
          src={photo}
          alt={dest.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className={cn('absolute inset-0 bg-gradient-to-br', dest.gradient)} />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-amber-500 px-2.5 py-1 rounded-full">
            <Flame className="w-3 h-3 text-white" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wide">Destaque</span>
          </div>
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/15">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[11px] font-bold text-white">{dest.rating}</span>
          </div>
        </div>
        <div>
          <span className="text-[10px] font-semibold text-white/60 uppercase tracking-widest">{dest.tag}</span>
          <h3 className="text-2xl font-black text-white leading-tight tracking-tight mt-0.5">{dest.name}</h3>
          <p className="text-sm text-white/70 flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            {dest.country}
          </p>
        </div>
      </div>

      {/* Arrow */}
      <div className="absolute right-5 bottom-5 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
        <ArrowRight className="w-4 h-4 text-white" />
      </div>
    </motion.div>
  );
}

function TrendingSmallCard({ dest, delay }: { dest: TrendingDest; delay: number }) {
  const router = useRouter();
  const photo = useDestinationPhoto(dest.query);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      onClick={() => router.push(`/dashboard/destinations/${encodeURIComponent(dest.name.toLowerCase())}`)}
      className="shrink-0 cursor-pointer group"
      style={{ width: 148 }}
    >
      <div className="relative h-[188px] rounded-xl overflow-hidden shadow-md group-hover:shadow-xl transition-shadow">
        {photo ? (
          <img src={photo} alt={dest.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        ) : (
          <div className={cn('absolute inset-0 bg-gradient-to-br', dest.gradient)}>
            <span className="absolute inset-0 flex items-center justify-center text-5xl opacity-20 select-none">{dest.emoji}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        {/* Rating */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-white/10">
          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
          <span className="text-[10px] font-bold text-white">{dest.rating}</span>
        </div>

        {/* Info */}
        <div className="absolute bottom-0 inset-x-0 p-3">
          <p className="text-sm font-bold text-white leading-tight">{dest.name}</p>
          <p className="text-[10px] text-white/60 mt-0.5">{dest.country}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Category bubble with real photo background ───────────────────────────────

interface CategoryItem {
  label: string;
  emoji: string;
  gradient: string;
  desc: string;
  query: string;
}

function CategoryBubble({ cat, delay }: { cat: CategoryItem; delay: number }) {
  const router = useRouter();
  const photo = useDestinationPhoto(cat.query);

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.06, y: -3 }}
      whileTap={{ scale: 0.93 }}
      onClick={() => router.push(`/dashboard/destinations/${encodeURIComponent(cat.label.toLowerCase())}`)}
      className="group flex flex-col items-center gap-2 cursor-pointer"
    >
      {/* Photo or gradient bubble */}
      <div className={cn(
        'relative w-full aspect-square rounded-2xl overflow-hidden',
        'shadow-md group-hover:shadow-lg transition-all duration-300',
        !photo && `bg-gradient-to-br ${cat.gradient}`,
      )}>
        {photo && (
          <img
            src={photo}
            alt={cat.label}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}
      </div>
      {/* Label */}
      <span className="text-[10px] md:text-[11px] font-semibold text-foreground/80 group-hover:text-foreground transition-colors leading-tight text-center">
        {cat.label}
      </span>
    </motion.button>
  );
}

/* ── Empty State ──────────────────────────────────────── */

function EmptyDashboard({ onNew }: { onNew: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-3xl border border-dashed border-border p-16 text-center"
    >
      {/* Mesh gradient BG */}
      <div className="absolute inset-0 mesh-gradient-1 dark:mesh-gradient-dark opacity-30" />
      <div className="absolute inset-0 bg-dot-grid dark:bg-dot-grid-dark opacity-20" />

      {/* Orbiting dots */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-2 h-2 rounded-full bg-indigo-400/40 animate-orbit" style={{ '--orbit-radius': '80px', '--orbit-duration': '10s' } as React.CSSProperties} />
        <div className="w-1.5 h-1.5 rounded-full bg-purple-400/30 animate-orbit" style={{ '--orbit-radius': '120px', '--orbit-duration': '15s' } as React.CSSProperties} />
        <div className="w-1 h-1 rounded-full bg-amber-400/30 animate-orbit" style={{ '--orbit-radius': '60px', '--orbit-duration': '8s' } as React.CSSProperties} />
      </div>

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 relative z-10 animate-pulse-glow"
      >
        <Globe className="w-10 h-10 text-primary" />
      </motion.div>

      <h3 className="text-xl font-semibold text-foreground tracking-tight mb-2 relative z-10">
        O mundo está esperando
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-8 relative z-10">
        Planeje roteiros, controle gastos e descubra destinos incríveis com inteligência artificial.
      </p>

      <div className="relative z-10 inline-flex">
        <button
          onClick={onNew}
          className="group relative z-10 flex items-center overflow-hidden rounded-full p-[1.5px]"
        >
          <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_340deg,#6366f1_360deg)]" />
          <span className="relative flex items-center rounded-full bg-zinc-900 px-8 py-4 ring-1 ring-white/10">
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
            </span>
            <Plus className="w-5 h-5 mr-2 text-indigo-300 relative z-10" />
            <span className="relative z-10 text-base font-medium tracking-wide text-white">Criar primeira viagem</span>
          </span>
        </button>
      </div>
    </motion.div>
  );
}
