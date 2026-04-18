'use client';

import { motion } from 'framer-motion';
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
import { useLocale, t, formatNumber, getCurrencySymbolByCode } from '@/lib/i18n';

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.07 } } },
  item: { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { ease: [0.4, 0, 0.2, 1] } } },
};

const TRIP_COLORS = [
  '#6366f1', '#a855f7', '#f59e0b', '#10b981', '#ef4444', '#ec4899',
];

const STATUS_BAR_COLOR: Record<string, string> = {
  PLANNING: 'from-indigo-500 to-violet-600',
  ONGOING: 'from-emerald-500 to-teal-600',
  COMPLETED: 'from-zinc-400 to-zinc-500',
  CANCELLED: 'from-red-400 to-red-500',
};

export default function BudgetPage() {
  const router = useRouter();
  const [locale] = useLocale();
  const { data, isLoading } = useTrips({ limit: 20 });
  const trips = data?.trips ?? [];

  const STATUS_LABEL: Record<string, string> = {
    PLANNING: t(locale, 'status.planning' as any),
    ONGOING: t(locale, 'status.ongoing' as any),
    COMPLETED: t(locale, 'status.completed' as any),
    CANCELLED: t(locale, 'status.cancelled' as any),
  };

  const totalBudget = trips.reduce((s, t) => s + Number(t.budget), 0);
  const totalSpent  = trips.reduce((s, t) => s + Number(t.totalSpent), 0);
  const totalRemaining = totalBudget - totalSpent;
  const overBudgetTrips = trips.filter(t => Number(t.totalSpent) > Number(t.budget));

  const barData = trips
    .filter(t => Number(t.budget) > 0)
    .map((t) => ({
      name: t.title.length > 12 ? t.title.slice(0, 12) + '…' : t.title,
      budget: Number(t.budget),
      spent: Number(t.totalSpent),
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
      label: t(locale, 'budget_page.total_budget' as any),
      value: formatNumber(locale, totalBudget),
      icon: Wallet,
      color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-50 dark:bg-indigo-500/10',
    },
    {
      label: t(locale, 'budget_page.total_spent' as any),
      value: formatNumber(locale, totalSpent),
      icon: TrendingUp,
      color: totalProgress >= 90 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400',
      bgColor: totalProgress >= 90 ? 'bg-red-50 dark:bg-red-500/10' : 'bg-amber-50 dark:bg-amber-500/10',
    },
    {
      label: t(locale, 'budget_page.balance' as any),
      value: formatNumber(locale, Math.max(totalRemaining, 0)),
      icon: TrendingDown,
      color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-500/10',
    },
    {
      label: t(locale, 'budget_page.over_budget' as any),
      value: overBudgetTrips.length,
      suffix: ` ${t(locale, 'budget_page.trips' as any)}`,
      icon: overBudgetTrips.length > 0 ? AlertTriangle : PiggyBank,
      color: overBudgetTrips.length > 0 ? 'text-red-600 dark:text-red-400' : 'text-purple-600 dark:text-purple-400',
      bgColor: overBudgetTrips.length > 0 ? 'bg-red-50 dark:bg-red-500/10' : 'bg-purple-50 dark:bg-purple-500/10',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-medium text-foreground tracking-tight">{t(locale, 'budget_page.title' as any)}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{t(locale, 'budget_page.subtitle' as any)}</p>
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
                  className="relative rounded-2xl border border-border bg-card p-5 overflow-hidden card-lift group"
                >
                  <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${stat.bgColor} blur-xl group-hover:scale-150 transition-transform duration-500`} />
                  <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center mb-3`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-0.5">{stat.label}</p>
                  <p className="text-xl font-medium text-foreground leading-tight tracking-tight">
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
            className="rounded-2xl border border-border bg-card p-5 shadow-card"
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-medium text-foreground">{t(locale, 'budget_page.used' as any)}</p>
              <span className="text-sm font-medium text-foreground">{totalProgress.toFixed(0)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full bg-gradient-to-r',
                  totalProgress >= 90 ? 'from-red-500 to-orange-400' :
                  totalProgress >= 70 ? 'from-amber-500 to-yellow-400' :
                  'from-indigo-500 to-violet-400'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${totalProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{formatNumber(locale, totalSpent)} {t(locale, 'budget_page.spent_label' as any)}</span>
              <span>{formatNumber(locale, totalBudget)} {t(locale, 'budget_page.total_label' as any)}</span>
            </div>
          </motion.div>

          {trips.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Bar chart */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl border border-border bg-card p-5 shadow-card"
              >
                <p className="font-medium text-foreground mb-4">{t(locale, 'budget_page.bar_title' as any)}</p>
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
                        formatter={(value) => `${formatNumber(locale, Number(value) || 0)}`}
                      />
                      <Bar dataKey="budget" fill="#6366f130" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="spent" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                    {t(locale, 'budget_page.no_budget' as any)}
                  </div>
                )}
              </motion.div>

              {/* Pie chart */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="rounded-2xl border border-border bg-card p-5 shadow-card"
              >
                <p className="font-medium text-foreground mb-4">{t(locale, 'budget_page.distribution' as any)}</p>
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
                          formatter={(value) => `${formatNumber(locale, Number(value) || 0)}`}
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
                          <span className="text-xs font-medium text-foreground shrink-0">
                            {entry.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-[140px] flex items-center justify-center text-sm text-muted-foreground">
                    {t(locale, 'budget_page.no_expenses' as any)}
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
              className="rounded-2xl border border-border bg-card p-5 shadow-card space-y-4"
            >
              <p className="font-medium text-foreground">{t(locale, 'budget_page.per_trip' as any)}</p>
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
                            className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate max-w-[200px]"
                          >
                            {trip.title}
                          </button>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {STATUS_LABEL[trip.status]}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={cn('text-xs font-medium', over ? 'text-red-400' : 'text-foreground')}>
                            {getCurrencySymbolByCode(trip.currency)} {formatNumber(locale, spent)}
                            <span className="text-muted-foreground font-normal"> / {formatNumber(locale, budget)}</span>
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
                            STATUS_BAR_COLOR[trip.status] ?? 'from-indigo-500 to-violet-400'
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
            <div className="rounded-2xl border border-border bg-card p-14 text-center shadow-card">
              <div className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-muted flex items-center justify-center mx-auto mb-5">
                <Wallet className="w-8 h-8 text-muted-foreground/40" />
              </div>
              <p className="font-medium text-foreground mb-1">{t(locale, 'budget_page.empty_title' as any)}</p>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                {t(locale, 'budget_page.empty_desc' as any)}
              </p>
              <button
                onClick={() => router.push('/dashboard/trips/new')}
                className="inline-flex items-center gap-2 bg-foreground text-background text-sm font-medium px-6 py-3 rounded-full hover:opacity-90 transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden"
              >
                <span className="relative z-10">{t(locale, 'trips.create' as any)}</span>
                <span className="absolute inset-0 overflow-hidden rounded-full">
                  <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
                </span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
