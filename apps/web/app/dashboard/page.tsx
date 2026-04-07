'use client';

import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Plus, PlaneTakeoff, Wallet, TrendingUp, CalendarDays,
  ArrowRight, Sparkles, ChevronRight, MapPin, Calendar,
  Eye, Pencil,
} from 'lucide-react';
import { useTrips } from '@/hooks/useTrips';
import { DestinationCard } from '@/components/cards/destination-card';
import { TripStories } from '@/components/dashboard/trip-stories';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

/* ── Data ──────────────────────────────────────────────── */

const TRENDING_DESTINATIONS = [
  { name: 'Bali', country: 'Indonésia', emoji: '🌊', gradient: 'from-emerald-600 to-teal-700', category: 'Praia', rating: 4.9 },
  { name: 'Paris', country: 'França', emoji: '🗼', gradient: 'from-sky-600 to-indigo-700', category: 'Cultural', rating: 4.8 },
  { name: 'Patagônia', country: 'Argentina', emoji: '🏔️', gradient: 'from-slate-600 to-slate-800', category: 'Aventura', rating: 4.9 },
  { name: 'Tóquio', country: 'Japão', emoji: '🎌', gradient: 'from-rose-600 to-pink-700', category: 'Cultural', rating: 4.8 },
  { name: 'Santorini', country: 'Grécia', emoji: '🏝️', gradient: 'from-blue-600 to-cyan-700', category: 'Praia', rating: 4.7 },
];

const CATEGORIES = [
  { label: 'Praias', emoji: '🏖️', color: 'from-sky-500 to-blue-600' },
  { label: 'Montanhas', emoji: '🏔️', color: 'from-emerald-600 to-teal-700' },
  { label: 'Cidades', emoji: '🌆', color: 'from-violet-600 to-purple-700' },
  { label: 'Aventura', emoji: '🧗', color: 'from-amber-500 to-orange-600' },
  { label: 'Cultural', emoji: '🏛️', color: 'from-rose-500 to-pink-600' },
  { label: 'Gastronomia', emoji: '🍜', color: 'from-orange-500 to-red-600' },
];

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.06 } } },
  item: { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { ease: [0.4, 0, 0.2, 1], duration: 0.35 } } },
};

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

/* ── Page ──────────────────────────────────────────────── */

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading } = useTrips({ limit: 5 });
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
      glowColor: 'group-hover:shadow-indigo-500/20',
    },
    {
      label: 'Orçamento', value: `R$\u00a0${totalBudget.toLocaleString('pt-BR')}`, suffix: 'total investido',
      icon: Wallet, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
      glowColor: 'group-hover:shadow-emerald-500/20',
    },
    {
      label: 'Gasto', value: `R$\u00a0${totalSpent.toLocaleString('pt-BR')}`,
      suffix: totalSpent > totalBudget * 0.9 && totalBudget > 0 ? 'limite próximo' : 'dentro do orçamento',
      icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-500/10',
      glowColor: 'group-hover:shadow-amber-500/20',
    },
    {
      label: 'Próxima', value: daysToNext !== null ? daysToNext : '—',
      suffix: daysToNext !== null && daysToNext < 7 ? 'dias — em breve!' : daysToNext !== null ? 'dias até partir' : 'nenhuma viagem',
      icon: CalendarDays, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-500/10',
      glowColor: 'group-hover:shadow-purple-500/20',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">

      {/* ═══════════════════════════════════════════════════════ */}
      {/* HERO — Compact & Alive                                */}
      {/* ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden mx-4 md:mx-6 mt-4 md:mt-6 rounded-3xl">
        {/* BG layers */}
        <div className="absolute inset-0 bg-zinc-900 dark:bg-zinc-950" />
        <div className="absolute inset-0 bg-dot-grid-dark opacity-20" />
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-indigo-500/15 blur-3xl animate-breathe" />
        <div className="absolute top-20 -left-24 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl animate-breathe" style={{ animationDelay: '2s' }} />
        {/* Conic spinner */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full animate-spin-slow opacity-[0.03]" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, #6366f1 90deg, transparent 180deg)' }} />

        {/* Content */}
        <div className="relative px-6 md:px-10 py-8 md:py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
          >
            {/* LEFT */}
            <div className="flex-1 min-w-0">
              <p className="text-zinc-500 text-[10px] font-mono mb-1.5 tracking-widest uppercase">
                {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
              <h1 className="text-2xl md:text-3xl font-medium text-white leading-tight tracking-tight mb-1.5">
                Bem-vindo, viajante
              </h1>
              <p className="text-zinc-400 text-sm font-light max-w-md">
                {nextTrip
                  ? `${nextTrip.destination} em ${daysToNext} dias. A aventura está quase chegando!`
                  : 'Pronto para planejar sua próxima aventura?'}
              </p>

              {nextTrip && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  onClick={() => router.push(`/dashboard/trips/${nextTrip.id}`)}
                  className="mt-4 inline-flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-2.5 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all group/trip"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-indigo-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-medium text-xs truncate uppercase tracking-wider">{nextTrip.title}</p>
                    <p className="text-zinc-500 text-[10px] truncate">{nextTrip.destination}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover/trip:text-zinc-400 transition-colors" />
                </motion.div>
              )}
            </div>

            {/* RIGHT — CTA */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="shrink-0"
            >
              {/* Beam button */}
              <div className="group relative">
                <div className="-inset-1 group-hover:opacity-100 transition duration-500 bg-indigo-500/20 opacity-0 rounded-full absolute blur-xl" />
                <button
                  onClick={() => router.push('/dashboard/trips/new')}
                  className="group relative z-10 flex items-center justify-center overflow-hidden rounded-full p-[1px] leading-none"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_340deg,#6366f1_360deg)]" />
                  <span className="relative flex h-full w-full items-center rounded-full bg-zinc-900 px-6 py-3 ring-1 ring-white/10">
                    <span className="absolute inset-0 overflow-hidden rounded-full">
                      <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
                    </span>
                    <Plus className="w-4 h-4 mr-2 text-indigo-300 relative z-10" />
                    <span className="relative z-10 text-sm font-medium tracking-wide text-white">Criar viagem</span>
                  </span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* STORIES — Trip Timeline                               */}
      {/* ═══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mt-6"
      >
        <div className="flex items-center justify-between px-4 md:px-6 mb-3">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Suas viagens</h2>
        </div>
        <TripStories trips={trips} />
      </motion.div>

      <div className="px-4 md:px-6 py-6 space-y-8">

        {/* ═══════════════════════════════════════════════════════ */}
        {/* STATS — Glowing Metric Cards                          */}
        {/* ═══════════════════════════════════════════════════════ */}
        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={stagger.item}
                ref={(el) => { flashlightRef.current[idx] = el; }}
                onMouseMove={(e) => handleMouseMove(e, idx)}
                className={cn(
                  'flashlight-card relative rounded-2xl border border-border bg-card p-4 overflow-hidden group cursor-default transition-all duration-300',
                  'hover:-translate-y-0.5 hover:shadow-lg',
                  stat.glowColor,
                )}
              >
                {/* Glow blob */}
                <div className={cn('absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500', stat.bgColor)} />

                {/* Icon container */}
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3 relative z-10 transition-all duration-300', stat.bgColor)}>
                  <Icon className={cn('w-[18px] h-[18px]', stat.color)} />
                </div>

                {/* Value first (primary hierarchy) */}
                <p className="text-xl font-semibold text-foreground leading-none tracking-tight relative z-10">
                  {stat.value}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 relative z-10 font-medium">{stat.label}</p>
                {stat.suffix && (
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5 relative z-10">{stat.suffix}</p>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* CATEGORIES — Exploration Chips                        */}
        {/* ═══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground tracking-tight">Explorar destinos</h2>
            <span className="text-xs text-primary font-medium cursor-pointer hover:text-primary/80 transition-colors">Ver todos</span>
          </div>

          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none md:hidden" />
            <div className="absolute right-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />

            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap snap-x snap-mandatory">
              {CATEGORIES.map((cat, i) => (
                <motion.button
                  key={cat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileHover={{ y: -4, scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex flex-col items-center gap-1.5 shrink-0 group snap-start"
                  onClick={() => router.push(`/dashboard/destinations/${encodeURIComponent(cat.label.toLowerCase())}`)}
                >
                  <div className={cn(
                    'w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-3xl shadow-sm transition-all duration-300',
                    'group-hover:shadow-lg group-hover:scale-[1.03]',
                    cat.color
                  )}>
                    {cat.emoji}
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">{cat.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* TRENDING DESTINATIONS                                 */}
        {/* ═══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground tracking-tight">Destinos em alta</h2>
              <span className="text-xs text-muted-foreground">🔥</span>
            </div>
            <Link href="/dashboard/destinations">
              <span className="flex items-center gap-1 text-xs text-primary font-medium hover:text-primary/80 transition-colors cursor-pointer">
                Ver todos <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>

          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none md:hidden" />
            <div className="absolute right-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />

            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory">
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

        {/* ═══════════════════════════════════════════════════════ */}
        {/* RECENT TRIPS — Interactive List                       */}
        {/* ═══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground tracking-tight">Viagens recentes</h2>
              {trips.length > 0 && (
                <span className="text-[10px] font-semibold text-muted-foreground px-1.5 py-0.5 rounded-md bg-muted">
                  {trips.length}
                </span>
              )}
            </div>
            <Link href="/dashboard/trips">
              <span className="flex items-center gap-1 text-xs text-primary font-medium hover:text-primary/80 transition-colors cursor-pointer">
                Ver todas <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4 p-4 border-b border-border last:border-0">
                  <div className="w-12 h-12 rounded-xl bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-muted animate-pulse rounded w-2/3" />
                    <div className="h-2.5 bg-muted animate-pulse rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : trips.length === 0 ? (
            <EmptyDashboard onNew={() => router.push('/dashboard/trips/new')} />
          ) : (
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="divide-y divide-border">
                {trips.map((trip, i) => {
                  const isActive = trip.status === 'ONGOING';
                  const fallback = GRADIENT_FALLBACKS[i % GRADIENT_FALLBACKS.length];

                  return (
                    <motion.div
                      key={trip.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 p-4 hover:bg-muted/40 transition-colors cursor-pointer group"
                      onClick={() => router.push(`/dashboard/trips/${trip.id}`)}
                    >
                      {/* Thumbnail */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-sm ring-1 ring-border">
                        {trip.coverImage ? (
                          <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className={cn('w-full h-full bg-gradient-to-br', fallback)} />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground tracking-tight truncate">{trip.title}</h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 shrink-0" />
                          {format(new Date(trip.startDate), "d MMM", { locale: ptBR })}
                          {' — '}
                          {format(new Date(trip.endDate), "d MMM yyyy", { locale: ptBR })}
                        </p>
                      </div>

                      {/* Status badge */}
                      <span className={cn(
                        'hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0',
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : trip.status === 'PLANNING'
                            ? 'bg-indigo-500/10 text-indigo-400'
                            : 'bg-muted text-muted-foreground',
                      )}>
                        {isActive && (
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                          </span>
                        )}
                        {STATUS_LABEL[trip.status]}
                      </span>

                      {/* Quick actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/trips/${trip.id}`); }}
                          className="w-7 h-7 rounded-lg bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
                          title="Ver"
                        >
                          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/trips/${trip.id}/edit`); }}
                          className="w-7 h-7 rounded-lg bg-muted/60 hover:bg-muted flex items-center justify-center transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                      </div>

                      <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* AI CTA — Premium Magic Entry                          */}
        {/* ═══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="relative overflow-hidden rounded-2xl"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-zinc-900 dark:bg-zinc-950" />
          <div className="absolute inset-0 bg-dot-grid-dark opacity-15" />

          {/* Animated accent blobs */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-indigo-500/20 blur-3xl animate-breathe" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-purple-500/15 blur-3xl animate-breathe" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full bg-amber-500/8 blur-3xl animate-breathe" style={{ animationDelay: '4s' }} />

          {/* Conic glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full animate-spin-slow opacity-[0.04]" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, #6366f1 90deg, transparent 120deg)' }} />

          {/* Content */}
          <div className="relative p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Icon */}
            <div className="relative shrink-0">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl border-2 border-indigo-500/30"
              />
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center animate-pulse-glow relative z-10">
                <Sparkles className="w-6 h-6 text-indigo-300" />
              </div>
            </div>

            {/* Copy */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-white text-base">Itinerário com IA</p>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 uppercase tracking-wider">novo</span>
              </div>
              <p className="text-zinc-400 text-sm font-light">Descreva seu destino e deixe a IA criar um roteiro completo.</p>
            </div>

            {/* CTA */}
            <Link href="/dashboard/ai" className="shrink-0">
              <button className="group relative flex items-center bg-white text-zinc-900 font-medium text-sm px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all overflow-hidden">
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

/* ── Empty State ───────────────────────────────────────── */

function EmptyDashboard({ onNew }: { onNew: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl border border-dashed border-border p-12 text-center bg-card"
    >
      <div className="absolute inset-0 bg-dot-grid dark:bg-dot-grid-dark opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,hsl(var(--primary)/0.06),transparent)]" />

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-primary/20 flex items-center justify-center mx-auto mb-5 relative z-10"
      >
        <PlaneTakeoff className="w-8 h-8 text-primary" />
      </motion.div>

      <h3 className="text-lg font-medium text-foreground tracking-tight mb-1.5 relative z-10">
        Sua próxima aventura começa aqui
      </h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6 relative z-10">
        Planeje roteiros, controle gastos e descubra destinos incríveis.
      </p>

      <div className="relative z-10 inline-flex">
        <button
          onClick={onNew}
          className="group relative z-10 flex items-center justify-center overflow-hidden rounded-full p-[1px] leading-none"
        >
          <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0_340deg,#6366f1_360deg)]" />
          <span className="relative flex h-full w-full items-center rounded-full bg-zinc-900 px-6 py-3 ring-1 ring-white/10">
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
