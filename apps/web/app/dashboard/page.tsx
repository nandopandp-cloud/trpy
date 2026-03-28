'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Plus, PlaneTakeoff, Wallet, TrendingUp, CalendarDays,
  ArrowRight, Sparkles, ChevronRight, MapPin,
} from 'lucide-react';
import { useTrips } from '@/hooks/useTrips';
import { TripCard } from '@/components/trips/trip-card';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/ui/skeletons';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

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
      icon: PlaneTakeoff, gradient: 'from-sky-500 to-blue-600', glow: 'glow-blue',
    },
    {
      label: 'Orçamento', value: `R$\u00a0${totalBudget.toLocaleString('pt-BR')}`, suffix: '',
      icon: Wallet, gradient: 'from-emerald-500 to-teal-600', glow: 'glow-teal',
    },
    {
      label: 'Gasto', value: `R$\u00a0${totalSpent.toLocaleString('pt-BR')}`, suffix: '',
      icon: TrendingUp, gradient: 'from-amber-500 to-orange-500', glow: 'glow-amber',
    },
    {
      label: 'Próxima', value: daysToNext !== null ? daysToNext : '—',
      suffix: daysToNext !== null ? ' dias' : '',
      icon: CalendarDays, gradient: 'from-violet-500 to-purple-600', glow: 'glow-violet',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* ── Hero banner ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden mx-4 md:mx-6 mt-4 md:mt-6 rounded-3xl">
        {/* Background */}
        <div className="absolute inset-0 bg-ocean" />
        <div className="absolute inset-0 dot-grid opacity-20" />
        <div className="absolute -top-8 -right-8 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-black/15 blur-3xl" />

        <div className="relative px-6 py-8 md:py-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-start justify-between gap-4"
          >
            <div>
              <p className="text-emerald-100/80 text-sm font-medium mb-1">
                {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                Olá, viajante ✈️
              </h1>
              <p className="text-emerald-100/75 mt-1.5 text-sm max-w-xs">
                {nextTrip
                  ? `${nextTrip.destination} em ${daysToNext} dias. Mal podemos esperar!`
                  : 'Pronto para planejar sua próxima aventura?'}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/dashboard/trips/new')}
              className="shrink-0 flex items-center gap-1.5 bg-white text-emerald-700 font-bold text-sm px-4 py-2.5 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nova viagem</span>
            </motion.button>
          </motion.div>

          {nextTrip && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              onClick={() => router.push(`/dashboard/trips/${nextTrip.id}`)}
              className="mt-5 flex items-center gap-3 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3 cursor-pointer hover:bg-white/20 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate">{nextTrip.title}</p>
                <p className="text-emerald-100/70 text-xs truncate">{nextTrip.destination}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/60 shrink-0" />
            </motion.div>
          )}
        </div>
      </section>

      <div className="px-4 md:px-6 py-6 space-y-8">
        {/* ── Stats ──────────────────────────────────────────────── */}
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
                className="relative rounded-2xl border border-border bg-card p-4 overflow-hidden card-lift group"
              >
                <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 blur-xl group-hover:opacity-20 transition-opacity`} />
                <div className={cn(`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3`, stat.glow)}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-muted-foreground mb-0.5">{stat.label}</p>
                <p className="text-xl font-black text-foreground leading-tight">
                  {stat.value}
                  {stat.suffix && <span className="text-sm font-normal text-muted-foreground">{stat.suffix}</span>}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── Categories ─────────────────────────────────────────── */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-foreground">Explorar destinos</h2>
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
                onClick={() => router.push('/dashboard/trips/new')}
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

        {/* ── Recent trips ───────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">Viagens recentes</h2>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
            </div>
          ) : trips.length === 0 ? (
            <EmptyDashboard onNew={() => router.push('/dashboard/trips/new')} />
          ) : (
            <motion.div
              variants={stagger.container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {trips.map((trip, i) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  index={i}
                  onClick={() => router.push(`/dashboard/trips/${trip.id}`)}
                  onEdit={() => router.push(`/dashboard/trips/${trip.id}/edit`)}
                />
              ))}
            </motion.div>
          )}
        </div>

        {/* ── AI CTA ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-emerald-500/8 via-teal-500/6 to-cyan-500/8 p-6"
        >
          <div className="absolute inset-0 dot-grid opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/8 blur-3xl pointer-events-none" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-12 h-12 rounded-2xl bg-ocean flex items-center justify-center glow-teal animate-pulse-glow shrink-0"
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <p className="font-bold text-foreground">Itinerário com IA</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Descreva seu destino e deixe a IA planejar tudo.
                </p>
              </div>
            </div>
            <Link href="/dashboard/ai">
              <Button className="gap-2 shrink-0 bg-ocean hover:opacity-90 glow-teal border-0">
                <Sparkles className="w-4 h-4" /> Experimentar
              </Button>
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
      className="relative overflow-hidden rounded-3xl border border-dashed border-border p-14 text-center"
    >
      <div className="absolute inset-0 mesh-bg" />
      <div className="relative space-y-5">
        <div className="text-5xl animate-float inline-block">✈️</div>
        <div>
          <p className="font-bold text-foreground text-lg">Sem viagens ainda</p>
          <p className="text-sm text-muted-foreground mt-1">Crie sua primeira aventura e comece a planejar.</p>
        </div>
        <Button onClick={onNew} className="gap-2 bg-ocean hover:opacity-90 border-0 glow-teal">
          <Plus className="w-4 h-4" /> Criar viagem
        </Button>
      </div>
    </motion.div>
  );
}
