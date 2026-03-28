'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, PlaneTakeoff, Wallet, TrendingUp, CalendarDays, ArrowRight, Sparkles } from 'lucide-react';
import { useTrips } from '@/hooks/useTrips';
import { TripCard } from '@/components/trips/trip-card';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/ui/skeletons';
import { useRouter } from 'next/navigation';

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.08 } } },
  item: { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { ease: [0.4, 0, 0.2, 1] } } },
};

export default function DashboardPage() {
  const router = useRouter();
  const { data, isLoading } = useTrips({ limit: 3 });
  const trips = data?.trips ?? [];

  const totalBudget = trips.reduce((s, t) => s + Number(t.budget), 0);
  const totalSpent  = trips.reduce((s, t) => s + Number(t.totalSpent), 0);
  const nextTrip    = trips.filter(t => t.status === 'PLANNING' || t.status === 'ONGOING')[0];
  const daysToNext  = nextTrip ? differenceInDays(new Date(nextTrip.startDate), new Date()) : null;

  const stats = [
    {
      label: 'Viagens', value: data?.total ?? 0, suffix: '',
      icon: PlaneTakeoff, color: 'from-blue-500 to-violet-500', glow: 'glow-blue',
    },
    {
      label: 'Orçamento total', value: `R$ ${totalBudget.toLocaleString('pt-BR')}`, suffix: '',
      icon: Wallet, color: 'from-emerald-500 to-teal-500', glow: 'glow-green',
    },
    {
      label: 'Total gasto', value: `R$ ${totalSpent.toLocaleString('pt-BR')}`, suffix: '',
      icon: TrendingUp, color: 'from-amber-500 to-orange-500', glow: 'glow-amber',
    },
    {
      label: 'Próxima viagem', value: daysToNext !== null ? daysToNext : '—',
      suffix: daysToNext !== null ? ' dias' : '',
      icon: CalendarDays, color: 'from-rose-500 to-pink-500', glow: 'glow-violet',
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-10">

      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-end justify-between"
      >
        <div>
          <p className="text-sm text-muted-foreground mb-1">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
          <h1 className="text-3xl font-bold">
            Olá, <span className="text-gradient">viajante</span> ✈️
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {nextTrip
              ? `Sua próxima viagem é para ${nextTrip.destination} em ${daysToNext} dias.`
              : 'Planeje sua próxima aventura.'}
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/trips/new')} className="gap-2 hidden sm:flex">
          <Plus className="w-4 h-4" /> Nova viagem
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={stagger.container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={stagger.item}
              className="relative rounded-2xl border border-border bg-card p-5 overflow-hidden card-lift group"
            >
              {/* BG glow */}
              <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${stat.color} opacity-10 blur-xl group-hover:opacity-20 transition-opacity`} />

              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 ${stat.glow}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">
                {stat.value}
                {stat.suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{stat.suffix}</span>}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent trips */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Viagens recentes</h2>
          <Link href="/dashboard/trips">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
              Ver todas <ArrowRight className="w-3.5 h-3.5" />
            </Button>
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
            {trips.map(trip => (
              <motion.div key={trip.id} variants={stagger.item}>
                <TripCard
                  trip={trip}
                  onClick={() => router.push(`/dashboard/trips/${trip.id}`)}
                  onEdit={() => router.push(`/dashboard/trips/${trip.id}/edit`)}
                  onDelete={() => {}}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* AI CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-purple-500/10 p-6"
      >
        <div className="absolute inset-0 dot-grid opacity-30" />
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center glow-blue animate-pulse-glow shrink-0">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Gere um itinerário com IA</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Descreva seu destino e deixe a IA planejar tudo para você.
              </p>
            </div>
          </div>
          <Link href="/dashboard/ai">
            <Button className="gap-2 shrink-0">
              <Sparkles className="w-4 h-4" /> Experimentar
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function EmptyDashboard({ onNew }: { onNew: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl border border-dashed border-border p-12 text-center"
    >
      <div className="absolute inset-0 mesh-bg" />
      <div className="relative space-y-4">
        <div className="text-5xl animate-float inline-block">✈️</div>
        <div>
          <p className="font-semibold text-foreground text-lg">Sem viagens ainda</p>
          <p className="text-sm text-muted-foreground mt-1">Crie sua primeira aventura e comece a planejar.</p>
        </div>
        <Button onClick={onNew} className="gap-2">
          <Plus className="w-4 h-4" /> Criar viagem
        </Button>
      </div>
    </motion.div>
  );
}
