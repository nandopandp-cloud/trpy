'use client';

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Plus, PlaneTakeoff, Wallet, TrendingUp, CalendarDays,
  ArrowRight, Sparkles, ChevronRight, MapPin, Calendar,
} from 'lucide-react';
import { useTrips } from '@/hooks/useTrips';
import { DestinationCard } from '@/components/cards/destination-card';
import { CardSkeleton } from '@/components/ui/skeletons';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const TRENDING_DESTINATIONS = [
  { name: 'Bali', country: 'Indonésia', emoji: '🌊', gradient: 'from-emerald-600 to-teal-700', category: 'Praia', rating: 4.9 },
  { name: 'Paris', country: 'França', emoji: '🗼', gradient: 'from-sky-600 to-indigo-700', category: 'Cultural', rating: 4.8 },
  { name: 'Patagônia', country: 'Argentina', emoji: '🏔️', gradient: 'from-slate-600 to-slate-800', category: 'Aventura', rating: 4.9 },
  { name: 'Tóquio', country: 'Japão', emoji: '🎌', gradient: 'from-rose-600 to-pink-700', category: 'Cultural', rating: 4.8 },
  { name: 'Santorini', country: 'Grécia', emoji: '🏝️', gradient: 'from-blue-600 to-cyan-700', category: 'Praia', rating: 4.7 },
];

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.08 } } },
  item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { ease: [0.4, 0, 0.2, 1], duration: 0.4 } } },
};

const CATEGORIES = [
  { label: 'Praias', emoji: '🏖️', color: 'from-sky-500 to-blue-600' },
  { label: 'Montanhas', emoji: '🏔️', color: 'from-emerald-600 to-teal-700' },
  { label: 'Cidades', emoji: '🌆', color: 'from-violet-600 to-purple-700' },
  { label: 'Aventura', emoji: '🧗', color: 'from-amber-500 to-orange-600' },
  { label: 'Cultural', emoji: '🏛️', color: 'from-rose-500 to-pink-600' },
  { label: 'Gastronomia', emoji: '🍜', color: 'from-orange-500 to-red-600' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading } = useTrips({ limit: 4 });
  const trips = data?.trips ?? [];
  const flashlightRef = useRef<(HTMLDivElement | null)[]>([]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>, idx: number) => {
    const el = flashlightRef.current[idx];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }, []);

  const totalBudget = trips.reduce((s, t) => s + Number(t.budget), 0);
  const totalSpent  = trips.reduce((s, t) => s + Number(t.totalSpent), 0);
  const nextTrip    = trips.find(t => t.status === 'PLANNING' || t.status === 'ONGOING');
  const daysToNext  = nextTrip ? differenceInDays(new Date(nextTrip.startDate), new Date()) : null;

  const stats = [
    {
      label: 'Viagens', value: data?.total ?? 0, suffix: 'planejadas',
      icon: PlaneTakeoff, color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
    },
    {
      label: 'Orçamento', value: `R$\u00a0${totalBudget.toLocaleString('pt-BR')}`, suffix: 'total investido',
      icon: Wallet, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      label: 'Gasto', value: `R$\u00a0${totalSpent.toLocaleString('pt-BR')}`, suffix: totalSpent > totalBudget * 0.9 ? '⚠️ limite próximo' : 'dentro do orçamento',
      icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-500/10',
    },
    {
      label: 'Próxima', value: daysToNext !== null ? daysToNext : '—',
      suffix: daysToNext !== null && daysToNext < 7 ? ' dias — em breve! 🎯' : daysToNext !== null ? ' dias até partir' : 'nenhuma viagem',
      icon: CalendarDays, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-500/10',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* ═══════════════════════════════════════════════════════════ */}
      {/* HERO — LIVING TRAVEL SURFACE */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden mx-4 md:mx-6 mt-4 md:mt-6 rounded-3xl">
        {/* Background layers */}
        <div className="absolute inset-0 bg-zinc-900 dark:bg-zinc-950" />
        <div className="absolute inset-0 bg-dot-grid-dark opacity-20" />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl animate-breathe" />
        <div className="absolute top-32 -left-32 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl animate-breathe" style={{ animationDelay: '2s' }} />
        <div className="absolute -bottom-20 right-1/4 w-80 h-80 rounded-full bg-amber-500/8 blur-3xl animate-breathe" style={{ animationDelay: '4s' }} />
        {/* Noise overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27noise%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.65%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23noise)%27/%3E%3C/svg%3E")' }} />
        {/* Conic gradient spinner */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full animate-spin-slow opacity-[0.03]" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, #6366f1 90deg, transparent 180deg)' }} />

        {/* Content */}
        <div className="relative px-6 md:px-10 py-10 md:py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            {/* LEFT — Greeting & next trip */}
            <div className="flex-1 min-w-0">
              <p className="text-zinc-500 text-xs font-mono mb-2 tracking-widest uppercase">
                {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
              <h1 className="text-3xl md:text-4xl font-medium text-white leading-tight tracking-tight mb-2">
                Bem-vindo, viajante
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-zinc-400 text-sm font-light max-w-lg mb-6"
              >
                {nextTrip
                  ? `${nextTrip.destination} em ${daysToNext} dias. A aventura está quase chegando! ✈️`
                  : 'Pronto para planejar sua próxima aventura?'}
              </motion.p>

              {nextTrip && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  onClick={() => router.push(`/dashboard/trips/${nextTrip.id}`)}
                  className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all group w-fit"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-indigo-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-xs truncate uppercase tracking-wider">{nextTrip.title}</p>
                    <p className="text-zinc-500 text-[10px] truncate">{nextTrip.destination}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                </motion.div>
              )}
            </div>

            {/* RIGHT — CTA + Quick stats (desktop) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="hidden md:flex flex-col gap-4 shrink-0"
            >
              {/* Beam button */}
              <div className="group relative">
                <div className="-inset-1 group-hover:opacity-100 transition duration-500 bg-indigo-500/20 opacity-0 rounded-full absolute blur-xl" />
                <button
                  onClick={() => router.push('/dashboard/trips/new')}
                  className="group relative z-10 flex items-center justify-center overflow-hidden rounded-full p-[1px] leading-none"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_340deg,#6366f1_360deg)]" />
                  <span className="relative flex h-full w-full items-center rounded-full bg-zinc-900 px-7 py-3.5 ring-1 ring-white/10">
                    <span className="absolute inset-0 overflow-hidden rounded-full">
                      <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
                    </span>
                    <Plus className="w-4 h-4 mr-2 text-indigo-300 relative z-10" />
                    <span className="relative z-10 text-sm font-medium tracking-wide text-white">Criar viagem</span>
                  </span>
                </button>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-white/5 px-3 py-2 border border-white/10 backdrop-blur-sm">
                  <p className="text-zinc-500 text-[10px] mb-0.5">Viagens</p>
                  <p className="text-white font-medium">{data?.total ?? 0}</p>
                </div>
                <div className="rounded-xl bg-white/5 px-3 py-2 border border-white/10 backdrop-blur-sm">
                  <p className="text-zinc-500 text-[10px] mb-0.5">Gastos</p>
                  <p className="text-white font-medium">R$ {(totalSpent / 1000).toFixed(1)}k</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="px-4 md:px-6 py-8 space-y-10">
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* STATS — INTERACTIVE GLOWING CARDS */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={stagger.item}
                ref={(el) => { flashlightRef.current[idx] = el; }}
                onMouseMove={(e) => handleMouseMove(e, idx)}
                className="flashlight-card relative rounded-2xl border border-border bg-card p-5 overflow-hidden group cursor-default hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                {/* Glow blob */}
                <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full ${stat.bgColor} blur-2xl group-hover:scale-150 transition-transform duration-500 opacity-30`} />

                {/* Icon */}
                <div className={`w-11 h-11 rounded-2xl ${stat.bgColor} flex items-center justify-center mb-3 relative z-10 group-hover:drop-shadow-lg transition-all duration-300`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>

                {/* Content */}
                <p className="text-xs text-muted-foreground mb-0.5 font-medium relative z-10">{stat.label}</p>
                <p className="text-2xl font-medium text-foreground leading-tight tracking-tight relative z-10">
                  {stat.value}
                </p>
                {stat.suffix && (
                  <p className="text-[10px] text-muted-foreground/70 mt-1 relative z-10 font-light">{stat.suffix}</p>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* CATEGORIES — INTERACTIVE DESTINATION EXPLORER */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-foreground tracking-tight">Explorar destinos</h2>
            <motion.span whileHover={{ x: 2 }} className="text-xs text-primary font-medium cursor-pointer hover:text-primary/80 transition-colors">
              Ver todos
            </motion.span>
          </div>

          <div className="relative">
            {/* Fade masks */}
            <div className="absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none md:hidden" />
            <div className="absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />

            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
              {CATEGORIES.map((cat, i) => (
                <motion.button
                  key={cat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  whileHover={{ y: -6, scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex flex-col items-center gap-2 shrink-0 group"
                  onClick={() => router.push(`/dashboard/destinations/${encodeURIComponent(cat.label.toLowerCase())}`)}
                >
                  <div className={cn(
                    'w-24 h-24 rounded-3xl bg-gradient-to-br flex items-center justify-center text-4xl shadow-card hover:shadow-xl transition-all duration-300 group-hover:scale-105',
                    cat.color
                  )}>
                    {cat.emoji}
                  </div>
                  <span className="text-xs font-medium text-muted-foreground whitespace-nowrap group-hover:text-foreground transition-colors">{cat.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* TRENDING DESTINATIONS */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-medium text-foreground tracking-tight">Destinos em alta</h2>
              <span className="text-xs font-mono text-muted-foreground">🔥</span>
            </div>
            <Link href="/dashboard/destinations">
              <motion.span whileHover={{ x: 2 }} className="flex items-center gap-1 text-sm text-primary font-medium hover:text-primary/80 transition-colors cursor-pointer">
                Ver todos <ArrowRight className="w-3.5 h-3.5" />
              </motion.span>
            </Link>
          </div>

          <div className="relative">
            {/* Fade masks */}
            <div className="absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none md:hidden" />
            <div className="absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />

            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0">
              {TRENDING_DESTINATIONS.map((dest, i) => (
                <DestinationCard
                  key={dest.name}
                  name={dest.name}
                  country={dest.country}
                  emoji={dest.emoji}
                  gradient={dest.gradient}
                  category={dest.category}
                  rating={dest.rating}
                  index={i}
                  onClick={() => router.push(`/dashboard/destinations/${encodeURIComponent(dest.name.toLowerCase())}`)}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* RECENT TRIPS */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-medium text-foreground tracking-tight">Viagens recentes</h2>
              {trips.length > 0 && (
                <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                  {trips.length}
                </span>
              )}
            </div>
            <Link href="/dashboard/trips">
              <motion.div whileHover={{ x: 2 }} className="flex items-center gap-1 text-sm text-primary font-medium hover:text-primary/80 transition-colors cursor-pointer">
                Ver todas <ArrowRight className="w-3.5 h-3.5" />
              </motion.div>
            </Link>
          </div>

          {isLoading ? (
            <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-card">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 p-5 border-b border-border last:border-0">
                  <div className="w-14 h-14 rounded-2xl bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : trips.length === 0 ? (
            <EmptyDashboard onNew={() => router.push('/dashboard/trips/new')} />
          ) : (
            <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-card">
              <div className="divide-y divide-border">
                {trips.map((trip, i) => {
                  const isActive = trip.status === 'ONGOING';
                  const STATUS_LABEL: Record<string, string> = {
                    PLANNING: 'Planejando',
                    ONGOING: 'Em andamento',
                    COMPLETED: 'Concluída',
                    CANCELLED: 'Cancelada',
                  };
                  const GRADIENT_FALLBACKS = [
                    'from-indigo-600 via-violet-600 to-purple-700',
                    'from-sky-600 via-blue-600 to-indigo-700',
                    'from-emerald-600 via-teal-600 to-cyan-700',
                    'from-amber-600 via-orange-500 to-red-600',
                  ];
                  const fallback = GRADIENT_FALLBACKS[i % GRADIENT_FALLBACKS.length];

                  return (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.3 }}
                      className="flex items-center gap-5 p-5 hover:bg-zinc-50/70 dark:hover:bg-muted/40 transition-colors cursor-pointer group"
                      onClick={() => router.push(`/dashboard/trips/${trip.id}`)}
                    >
                      {/* Image thumbnail */}
                      <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 shadow-sm">
                        {trip.coverImage ? (
                          <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className={cn('w-full h-full bg-gradient-to-br', fallback)} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground tracking-tight truncate">{trip.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 shrink-0" />
                          {format(new Date(trip.startDate), "d MMM", { locale: ptBR })}
                          {' — '}
                          {format(new Date(trip.endDate), "d MMM yyyy", { locale: ptBR })}
                        </p>
                      </div>

                      {/* Status badge */}
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0',
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : trip.status === 'PLANNING'
                            ? 'bg-indigo-500/10 text-indigo-400'
                            : 'bg-muted text-muted-foreground',
                      )}>
                        {isActive && (
                          <span className="relative flex h-1.5 w-1.5 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                          </span>
                        )}
                        {STATUS_LABEL[trip.status]}
                      </span>

                      {/* Chevron */}
                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* AI CTA — MAGIC ENTRY POINT */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-zinc-900 dark:bg-zinc-950 p-6 md:p-8"
        >
          {/* Background layers */}
          <div className="absolute inset-0 bg-dot-grid-dark opacity-20" />
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-indigo-500/15 blur-3xl animate-breathe" />
          <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl animate-breathe" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full animate-spin-slow opacity-[0.03]" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, #6366f1 90deg, transparent 120deg)' }} />

          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Icon with pulsing rings */}
            <div className="relative shrink-0">
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl border-2 border-indigo-500/30"
              />
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center animate-pulse-glow relative z-10">
                <Sparkles className="w-7 h-7 text-indigo-300" />
              </div>
            </div>

            {/* Copy */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="font-medium text-white text-lg">Itinerário com IA</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 uppercase tracking-wide">novo</span>
              </div>
              <p className="text-zinc-400 text-sm">Descreva seu destino e deixe a IA criar um roteiro completo.</p>
            </div>

            {/* Beam button (white variant) */}
            <Link href="/dashboard/ai" className="shrink-0">
              <button className="group relative flex items-center bg-white text-zinc-900 font-medium text-sm px-6 py-3.5 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all overflow-hidden">
                <Sparkles className="w-4 h-4 mr-2 relative z-10" />
                <span className="relative z-10">Experimentar</span>
                <span className="absolute inset-0 overflow-hidden rounded-full">
                  <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-black/10 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
                </span>
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function EmptyDashboard({ onNew }: { onNew: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-3xl border border-dashed border-border p-16 text-center bg-card"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-dot-grid dark:bg-dot-grid-dark opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,hsl(var(--primary)/0.06),transparent)]" />

      {/* Floating icon */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 relative z-10"
      >
        <PlaneTakeoff className="w-10 h-10 text-primary" />
      </motion.div>

      {/* Copy */}
      <h3 className="text-xl font-medium text-foreground tracking-tight mb-2 relative z-10">
        Sua próxima aventura começa aqui
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-8 relative z-10">
        Planeje roteiros, controle gastos e descubra destinos incríveis com a IA.
      </p>

      {/* Beam button */}
      <div className="relative z-10 inline-flex">
        <div className="-inset-1 group-hover:opacity-100 transition duration-500 bg-indigo-500/20 opacity-0 rounded-full absolute blur-xl" />
        <button
          onClick={onNew}
          className="group relative z-10 flex items-center justify-center overflow-hidden rounded-full p-[1px] leading-none"
        >
          <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_340deg,#6366f1_360deg)]" />
          <span className="relative flex h-full w-full items-center rounded-full bg-zinc-900 px-7 py-3.5 ring-1 ring-white/10">
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
            </span>
            <Plus className="w-4 h-4 mr-2 text-indigo-300 relative z-10" />
            <span className="relative z-10 text-sm font-medium tracking-wide text-white">Criar primeira viagem</span>
          </span>
        </button>
      </div>
    </motion.div>
  );
}
