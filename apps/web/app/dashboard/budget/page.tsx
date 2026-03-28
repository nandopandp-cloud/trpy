'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank,
  ArrowRight, AlertTriangle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { useTrips } from '@/hooks/useTrips';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/ui/skeletons';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } },
  item: { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { ease: [0.4, 0, 0.2, 1] } } },
};

const TRIP_COLORS = [
  '#10B981', '#0891B2', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899',
];

const STATUS_LABEL: Record<string, string> = {
  PLANNING: 'Planejando',
  ONGOING: 'Em andamento',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
};

const STATUS_BAR_COLOR: Record<string, string> = {
  PLANNING: 'from-sky-500 to-blue-600',
  ONGOING: 'from-emerald-500 to-teal-600',
  COMPLETED: 'from-slate-400 to-slate-500',
  CANCELLED: 'from-red-400 to-red-500',
};

export default function BudgetPage() {
  const router = useRouter();
  const { data, isLoading } = useTrips({ limit: 20 });
  const trips = data?.trips ?? [];

  const totalBudget = trips.reduce((s, t) => s + Number(t.budget), 0);
  const totalSpent  = trips.reduce((s, t) => s + Number(t.totalSpent), 0);
  const totalRemaining = totalBudget - totalSpent;
  const overBudgetTrips = trips.filter(t => Number(t.totalSpent) > Number(t.budget));

  const barData = trips
    .filter(t => Number(t.budget) > 0)
    .map((t) => ({
      name: t.title.length > 12 ? t.title.slice(0, 12) + '…' : t.title,
      orçamento: Number(t.budget),
      gasto: Number(t.totalSpent),
    }));

  const pieData = trips
    .filter(t => Number(t.totalSpent) > 0)
    .map((t, i) => ({
      name: t.title,
      value: Number(t.totalSpent),
      color: TRIP_COLORS[i % TRIP_COLORS.length],
    }));

  const totalProgress = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

  const stats = [
    {
      label: 'Orçamento total',
      value: `R$ ${totalBudget.toLocaleString('pt-BR')}`,
      icon: Wallet,
      gradient: 'from-emerald-500 to-teal-600',
      glow: 'glow-teal',
    },
    {
      label: 'Total gasto',
      value: `R$ ${totalSpent.toLocaleString('pt-BR')}`,
      icon: TrendingUp,
      gradient: totalProgress >= 90 ? 'from-red-500 to-orange-500' : 'from-amber-500 to-orange-500',
      glow: 'glow-amber',
    },
    {
      label: 'Saldo restante',
      value: `R$ ${Math.max(totalRemaining, 0).toLocaleString('pt-BR')}`,
      icon: TrendingDown,
      gradient: 'from-sky-500 to-blue-600',
      glow: 'glow-blue',
    },
    {
      label: 'Acima do orçamento',
      value: overBudgetTrips.length,
      suffix: ' viagens',
      icon: overBudgetTrips.length > 0 ? AlertTriangle : PiggyBank,
      gradient: overBudgetTrips.length > 0 ? 'from-red-500 to-rose-600' : 'from-violet-500 to-purple-600',
      glow: overBudgetTrips.length > 0 ? '' : 'glow-violet',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-black text-foreground">Finanças</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Visão consolidada de orçamentos e gastos</p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          {/* Stats */}
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
                  className="relative rounded-3xl border border-border bg-card p-5 overflow-hidden card-lift group"
                >
                  <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 blur-xl group-hover:opacity-20 transition-opacity`} />
                  <div className={cn(`w-10 h-10 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3`, stat.glow)}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-0.5">{stat.label}</p>
                  <p className="text-xl font-black text-foreground leading-tight">
                    {stat.value}
                    {'suffix' in stat && stat.suffix && (
                      <span className="text-sm font-normal text-muted-foreground">{stat.suffix}</span>
                    )}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Global progress */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-3xl border border-border bg-card p-5 shadow-card"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-foreground">Orçamento total utilizado</p>
              <span className="text-sm font-bold text-foreground">{totalProgress.toFixed(0)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full bg-gradient-to-r',
                  totalProgress >= 90 ? 'from-red-500 to-orange-400' :
                  totalProgress >= 70 ? 'from-amber-500 to-yellow-400' :
                  'from-emerald-500 to-teal-400'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${totalProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>R$ {totalSpent.toLocaleString('pt-BR')} gastos</span>
              <span>R$ {totalBudget.toLocaleString('pt-BR')} total</span>
            </div>
          </motion.div>

          {trips.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Bar chart */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-3xl border border-border bg-card p-5 shadow-card"
              >
                <p className="font-bold text-foreground mb-4">Orçamento × Gasto por viagem</p>
                {barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData} barGap={4} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                          fontSize: '12px',
                        }}
                        formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`}
                      />
                      <Bar dataKey="orçamento" fill="#10B98130" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="gasto" fill="#10B981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                    Nenhuma viagem com orçamento definido.
                  </div>
                )}
              </motion.div>

              {/* Pie chart */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="rounded-3xl border border-border bg-card p-5 shadow-card"
              >
                <p className="font-bold text-foreground mb-4">Distribuição de gastos</p>
                {pieData.length > 0 ? (
                  <div className="flex items-center gap-6">
                    <ResponsiveContainer width={140} height={140}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={65}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                            fontSize: '12px',
                          }}
                          formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex-1 space-y-2">
                      {pieData.slice(0, 5).map((entry, i) => (
                        <div key={i} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                            <span className="text-xs text-muted-foreground truncate">{entry.name}</span>
                          </div>
                          <span className="text-xs font-semibold text-foreground shrink-0">
                            R$ {entry.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-[140px] flex items-center justify-center text-sm text-muted-foreground">
                    Nenhum gasto registrado ainda.
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* Per-trip budget breakdown */}
          {trips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-3xl border border-border bg-card p-5 shadow-card space-y-4"
            >
              <p className="font-bold text-foreground">Por viagem</p>
              <div className="space-y-4">
                {trips.map((trip) => {
                  const budget = Number(trip.budget);
                  const spent = Number(trip.totalSpent);
                  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
                  const over = spent > budget;

                  return (
                    <div key={trip.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <button
                            onClick={() => router.push(`/dashboard/trips/${trip.id}`)}
                            className="text-sm font-semibold text-foreground hover:text-primary transition-colors truncate max-w-[200px]"
                          >
                            {trip.title}
                          </button>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {STATUS_LABEL[trip.status]}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={cn('text-xs font-semibold', over ? 'text-red-400' : 'text-foreground')}>
                            R$ {spent.toLocaleString('pt-BR')}
                            <span className="text-muted-foreground font-normal"> / {budget.toLocaleString('pt-BR')}</span>
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => router.push(`/dashboard/trips/${trip.id}`)}
                          >
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={cn(
                            'h-full rounded-full bg-gradient-to-r',
                            over ? 'from-red-500 to-orange-400' :
                            pct >= 70 ? 'from-amber-500 to-yellow-400' :
                            STATUS_BAR_COLOR[trip.status] ?? 'from-emerald-500 to-teal-400'
                          )}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {trips.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border p-14 text-center">
              <div className="text-4xl mb-4">💰</div>
              <p className="font-semibold text-foreground">Sem dados financeiros</p>
              <p className="text-sm text-muted-foreground mt-1 mb-5">
                Crie viagens e registre despesas para ver análises aqui.
              </p>
              <Button
                onClick={() => router.push('/dashboard/trips/new')}
                className="bg-ocean hover:opacity-90 border-0 glow-teal"
              >
                Criar viagem
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
