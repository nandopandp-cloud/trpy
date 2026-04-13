'use client';

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart,
} from 'recharts';
import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Expense, Trip } from '@trpy/database';
import { GradientProgress } from '@/components/ui/gradient-progress';
import { cn } from '@/lib/utils';
import { useLocale, t, formatNumber } from '@/lib/i18n';

const CATEGORY_LABEL_KEYS: Record<string, string> = {
  ACCOMMODATION: 'category.accommodation',
  FOOD: 'category.food',
  TRANSPORT: 'category.transport',
  ACTIVITIES: 'category.activities',
  SHOPPING: 'category.shopping',
  HEALTH: 'category.health',
  OTHER: 'category.other',
};

const CATEGORY_COLORS: Record<string, string> = {
  ACCOMMODATION: '#0891B2',
  FOOD: '#F59E0B',
  TRANSPORT: '#8B5CF6',
  ACTIVITIES: '#10B981',
  SHOPPING: '#EC4899',
  HEALTH: '#EF4444',
  OTHER: '#94A3B8',
};

interface BudgetDashboardProps {
  trip: Trip;
  expenses: Expense[];
}

export function BudgetDashboard({ trip, expenses }: BudgetDashboardProps) {
  const [locale] = useLocale();
  const budget = Number(trip.budget);
  const spent = Number(trip.totalSpent);
  const remaining = budget - spent;
  const progress = budget > 0 ? (spent / budget) * 100 : 0;
  const progressColor = progress >= 90 ? 'red' : progress >= 70 ? 'amber' : 'green';

  // Group by category
  const byCategory = expenses.reduce((acc, e) => {
    const cat = e.category;
    acc[cat] = (acc[cat] ?? 0) + Number(e.amount);
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value, label: t(locale, (CATEGORY_LABEL_KEYS[name] ?? 'category.other') as any) }))
    .sort((a, b) => b.value - a.value);

  // Spending over time (cumulative)
  const sortedExpenses = [...expenses].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  let cumulative = 0;
  const trendData = sortedExpenses.map((e) => {
    cumulative += Number(e.amount);
    return {
      date: format(new Date(e.date), 'd MMM', { locale: ptBR }),
      total: cumulative,
    };
  });

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '12px',
    fontSize: '12px',
  };

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label={t(locale, 'budget.total')}
          value={`${trip.currency} ${formatNumber(locale, budget)}`}
          icon={<Wallet className="w-4 h-4" />}
          color="green"
        />
        <StatCard
          label={t(locale, 'budget.spent')}
          value={`${trip.currency} ${formatNumber(locale, spent)}`}
          icon={<TrendingUp className="w-4 h-4" />}
          color={progress >= 90 ? 'red' : 'amber'}
        />
        <StatCard
          label={t(locale, 'budget.remaining')}
          value={`${trip.currency} ${formatNumber(locale, Math.max(remaining, 0))}`}
          icon={<TrendingDown className="w-4 h-4" />}
          color="green"
        />
        <StatCard
          label={t(locale, 'budget.used')}
          value={`${Math.round(progress)}%`}
          icon={<DollarSign className="w-4 h-4" />}
          color={progress >= 90 ? 'red' : progress >= 70 ? 'amber' : 'green'}
        />
      </div>

      {/* Progress bar */}
      <div className="rounded-3xl border border-border bg-card p-4">
        <p className="text-sm font-bold text-foreground mb-3">{t(locale, 'budget.progress')}</p>
        <GradientProgress
          value={spent}
          max={budget}
          color={progressColor}
          label={t(locale, 'budget.spent_of').replace('{spent}', `${trip.currency} ${formatNumber(locale, spent)}`).replace('{total}', formatNumber(locale, budget))}
        />
      </div>

      {expenses.length > 0 && (
        <>
          {/* Spending trend */}
          {trendData.length > 1 && (
            <div className="rounded-3xl border border-border bg-card p-4">
              <p className="text-sm font-bold text-foreground mb-4">{t(locale, 'budget.trend')}</p>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value) => [`${trip.currency} ${formatNumber(locale, Number(value) || 0)}`, 'Total']}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fill="url(#tealGrad)"
                    dot={false}
                    activeDot={{ r: 5, fill: '#10B981', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Donut chart */}
            <div className="rounded-3xl border border-border bg-card p-4">
              <p className="text-sm font-bold text-foreground mb-4">{t(locale, 'budget.by_category')}</p>
              <div className="flex items-center gap-4">
                <ResponsiveContainer width={110} height={110}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={32}
                      outerRadius={52}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={CATEGORY_COLORS[entry.name] ?? '#94A3B8'}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) =>
                        `${trip.currency} ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="flex-1 space-y-1.5">
                  {pieData.slice(0, 5).map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[entry.name] ?? '#94A3B8' }}
                        />
                        <span className="text-xs text-muted-foreground truncate">{entry.label}</span>
                      </div>
                      <span className="text-xs font-semibold text-foreground shrink-0">
                        {entry.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent expenses */}
            <div className="rounded-3xl border border-border bg-card p-4">
              <p className="text-sm font-bold text-foreground mb-3">{t(locale, 'budget.recent')}</p>
              <div className="space-y-2.5">
                {expenses.slice(0, 6).map((expense) => (
                  <div key={expense.id} className="flex items-center gap-2.5">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[expense.category] ?? '#94A3B8' }}
                    />
                    <span className="text-xs text-foreground truncate flex-1">{expense.title}</span>
                    <span className="text-xs font-semibold text-foreground shrink-0">
                      {expense.currency} {Number(expense.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {expenses.length === 0 && (
        <div className="rounded-3xl border border-dashed border-border p-10 text-center">
          <div className="text-3xl mb-3">💸</div>
          <p className="text-sm font-medium text-foreground">{t(locale, 'budget.empty')}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {t(locale, 'budget.empty_desc')}
          </p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: 'green' | 'amber' | 'red';
}) {
  const colorMap = {
    green: 'text-emerald-400 bg-emerald-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    red: 'text-red-400 bg-red-500/10',
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-2">
      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', colorMap[color])}>
        {icon}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-base font-bold text-foreground leading-tight">{value}</p>
    </div>
  );
}
