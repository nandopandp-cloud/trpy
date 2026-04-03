'use client';

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

  const totalBudget = trips.reduce((s, t) => s + Number(t.budget), 0);
  const totalSpent  = trips.reduce((s, t) => s + Number(t.totalSpent), 0);
  const nextTrip    = trips.find(t => t.status === 'PLANNING' || t.status === 'ONGOING');
  const daysToNext  = nextTrip ? differenceInDays(new Date(nextTrip.startDate), new Date()) : null;

  const stats = [
    {
      label: 'Viagens', value: data?.total ?? 0, suffix: '',
      icon: PlaneTakeoff, color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
    },
    {
      label: 'Orçamento', value: `R$\u00a0${totalBudget.toLocaleString('pt-BR')}`, suffix: '',
      icon: Wallet, color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      label: 'Gasto', value: `R$\u00a0${totalSpent.toLocaleString('pt-BR')}`, suffix: '',
      icon: TrendingUp, color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-500/10',
    },
    {
      label: 'Próxima', value: daysToNext !== null ? daysToNext : '—',
      suffix: daysToNext !== null ? ' dias' : '',
      icon: CalendarDays, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-500/10',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* ── Hero banner ─────────────────────────────────── */}
      <section className="relative overflow-hidden mx-4 md:mx-6 mt-4 md:mt-6 rounded-2xl">
        {/* Background — explicit zinc-900 to stay dark in both light and dark mode */}
        <div className="absolute inset-0 bg-zinc-900 dark:bg-zinc-950" />
        <div className="absolute inset-0 bg-dot-grid-dark opacity-20" />
        <div className="absolute -top-8 -right-8 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
        {/* Spinning accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full animate-spin-slow opacity-[0.03]" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, #6366f1 90deg, transparent 180deg)' }} />

        <div className="relative px-6 py-8 md:py-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-start justify-between gap-4"
          >
            <div>
              <p className="text-zinc-400 text-sm font-medium mb-1">
                {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
              <h1 className="text-2xl md:text-3xl font-medium text-white leading-tight tracking-tight">
                Olá, viajante
              </h1>
              <p className="text-zinc-500 mt-1.5 text-sm max-w-xs">
                {nextTrip
                  ? `${nextTrip.destination} em ${daysToNext} dias. Mal podemos esperar!`
                  : 'Pronto para planejar sua próxima aventura?'}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard/trips/new')}
              className="shrink-0 flex items-center gap-1.5 bg-white text-zinc-900 font-medium text-sm px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all group relative overflow-hidden"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova viagem</span>
              <span className="absolute inset-0 overflow-hidden rounded-full">
                <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-black/5 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
              </span>
            </motion.button>
          </motion.div>

          {nextTrip && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              onClick={() => router.push(`/dashboard/trips/${nextTrip.id}`)}
              className="mt-5 flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 cursor-pointer hover:bg-white/10 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{nextTrip.title}</p>
                <p className="text-zinc-500 text-xs truncate">{nextTrip.destination}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 shrink-0" />
            </motion.div>
          )}
        </div>
      </section>

      <div className="px-4 md:px-6 py-6 space-y-8">
        {/* ── Stats ──────────────────────────────────────── */}
        <motion.div
          variants={stagger.container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={stagger.item}
                className="relative rounded-2xl border border-border bg-card p-4 overflow-hidden card-lift group hover:shadow-md transition-all"
              >
                <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${stat.bgColor} blur-xl group-hover:scale-150 transition-transform duration-500`} />
                <div className={`w-9 h-9 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-xs text-muted-foreground mb-0.5">{stat.label}</p>
                <p className="text-xl font-medium text-foreground leading-tight tracking-tight">
                  {stat.value}
                  {stat.suffix && <span className="text-sm font-normal text-muted-foreground">{stat.suffix}</span>}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Categories ─────────────────────────────────── */}
        <div className="space-y-3">
          <h2 className="text-base font-medium text-foreground tracking-tight">Explorar destinos</h2>
          <div className="flex gap-3 scroll-x-hidden pb-1 -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
            {CATEGORIES.map((cat, i) => (
              <motion.button
                key={cat.label}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.94 }}
                className="flex flex-col items-center gap-1.5 shrink-0"
                onClick={() => router.push(`/dashboard/destinations/${encodeURIComponent(cat.label.toLowerCase())}`)}
              >
                <div className={cn(
                  'w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-2xl shadow-card',
                  cat.color
                )}>
                  {cat.emoji}
                </div>
                <span className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">{cat.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Trending destinations ──────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-foreground tracking-tight">Destinos em alta</h2>
            <Link href="/dashboard/trips/new">
              <motion.span
                whileHover={{ x: 2 }}
                className="flex items-center gap-1 text-sm text-primary font-medium hover:text-primary/80 transition-colors"
              >
                Planejar <ArrowRight className="w-3.5 h-3.5" />
              </motion.span>
            </Link>
          </div>
          <div className="flex gap-4 scroll-x-hidden pb-2 -mx-4 px-4 md:mx-0 md:px-0">
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

        {/* ── Recent trips ───────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-foreground tracking-tight">Viagens recentes</h2>
            <Link href="/dashboard/trips">
              <motion.div
                whileHover={{ x: 2 }}
                className="flex items-center gap-1 text-sm text-primary font-medium hover:text-primary/80 transition-colors"
              >
                Ver todas <ArrowRight className="w-3.5 h-3.5" />
              </motion.div>
            </Link>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
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
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-card">
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
                      className="flex items-center gap-5 p-5 hover:bg-muted/30 transition-colors cursor-pointer group"
                      onClick={() => router.push(`/dashboard/trips/${trip.id}`)}
                    >
                      {/* Image thumbnail */}
                      <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0">
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
        </div>

        {/* ── AI CTA ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-primary/[0.03] p-6"
        >
          <div className="absolute inset-0 bg-dot-grid dark:bg-dot-grid-dark opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center glow-indigo animate-pulse-glow shrink-0"
              >
                <Sparkles className="w-6 h-6 text-primary" />
              </motion.div>
              <div>
                <p className="font-medium text-foreground">Itinerário com IA</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Descreva seu destino e deixe a IA planejar tudo.
                </p>
              </div>
            </div>
            <Link href="/dashboard/ai">
              <button className="shrink-0 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-medium px-5 py-2.5 rounded-full hover:opacity-90 transition-all flex items-center gap-2 group relative overflow-hidden">
                <Sparkles className="w-4 h-4" />
                <span className="relative z-10">Experimentar</span>
                <span className="absolute inset-0 overflow-hidden rounded-full">
                  <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
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
      className="relative overflow-hidden rounded-2xl border border-dashed border-border p-14 text-center"
    >
      <div className="absolute inset-0 bg-dot-grid dark:bg-dot-grid-dark opacity-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="relative space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-muted flex items-center justify-center mx-auto mb-2 animate-float">
            <PlaneTakeoff className="w-8 h-8 text-muted-foreground/50" />
          </div>
        <div>
          <p className="font-medium text-foreground text-lg">Sem viagens ainda</p>
          <p className="text-sm text-muted-foreground mt-1">Crie sua primeira aventura e comece a planejar.</p>
        </div>
        <button
          onClick={onNew}
          className="inline-flex items-center gap-2 bg-foreground text-background text-sm font-medium px-6 py-3 rounded-full hover:opacity-90 transition-all group relative overflow-hidden"
        >
          <Plus className="w-4 h-4" />
          <span className="relative z-10">Criar viagem</span>
          <span className="absolute inset-0 overflow-hidden rounded-full">
            <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
          </span>
        </button>
      </div>
    </motion.div>
  );
}
