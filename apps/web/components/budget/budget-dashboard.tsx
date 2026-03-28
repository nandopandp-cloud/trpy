'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { Expense, Trip } from '@trpy/database';
import { GradientProgress } from '@/components/ui/gradient-progress';
import { cn } from '@/lib/utils';

const CATEGORY_LABELS: Record<string, string> = {
  ACCOMMODATION: 'Hospedagem',
  FOOD: 'Alimentação',
  TRANSPORT: 'Transporte',
  ACTIVITIES: 'Atividades',
  SHOPPING: 'Compras',
  HEALTH: 'Saúde',
  OTHER: 'Outros',
};

const CATEGORY_COLORS: Record<string, string> = {
  ACCOMMODATION: '#3B82F6',
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
  const budget = Number(trip.budget);
  const spent = Number(trip.totalSpent);
  const remaining = budget - spent;
  const progress = budget > 0 ? (spent / budget) * 100 : 0;
  const progressColor = progress >= 90 ? 'red' : progress >= 70 ? 'amber' : 'green';

  // Agrupar por categoria
  const byCategory = expenses.reduce((acc, e) => {
    const cat = e.category;
    acc[cat] = (acc[cat] ?? 0) + Number(e.amount);
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(byCategory)
    .map(([name, value]) => ({ name, value, label: CATEGORY_LABELS[name] ?? name }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Orçamento"
          value={`${trip.currency} ${budget.toLocaleString('pt-BR')}`}
          icon={<Wallet className="w-4 h-4" />}
          color="green"
        />
        <StatCard
          label="Gasto"
          value={`${trip.currency} ${spent.toLocaleString('pt-BR')}`}
          icon={<TrendingUp className="w-4 h-4" />}
          color={progress >= 90 ? 'red' : 'amber'}
        />
        <StatCard
          label="Restante"
          value={`${trip.currency} ${Math.max(remaining, 0).toLocaleString('pt-BR')}`}
          icon={<TrendingDown className="w-4 h-4" />}
          color="green"
        />
        <StatCard
          label="Utilizado"
          value={`${Math.round(progress)}%`}
          icon={<DollarSign className="w-4 h-4" />}
          color={progress >= 90 ? 'red' : progress >= 70 ? 'amber' : 'green'}
        />
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium text-foreground mb-3">Progresso do orçamento</p>
        <GradientProgress
          value={spent}
          max={budget}
          color={progressColor}
          label={`${trip.currency} ${spent.toLocaleString('pt-BR')} gasto de ${budget.toLocaleString('pt-BR')}`}
        />
      </div>

      {expenses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Donut chart */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium text-foreground mb-4">Por categoria</p>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={56}
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
                    formatter={(value) =>
                      `${trip.currency} ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                    }
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="flex-1 space-y-2">
                {pieData.slice(0, 5).map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[entry.name] ?? '#94A3B8' }}
                      />
                      <span className="text-xs text-muted-foreground truncate">{entry.label}</span>
                    </div>
                    <span className="text-xs font-medium text-foreground shrink-0">
                      {trip.currency} {entry.value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expense list recente */}
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium text-foreground mb-3">Últimas despesas</p>
            <div className="space-y-2">
              {expenses.slice(0, 6).map((expense) => (
                <div key={expense.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_COLORS[expense.category] ?? '#94A3B8' }}
                    />
                    <span className="text-xs text-foreground truncate">{expense.title}</span>
                  </div>
                  <span className="text-xs font-medium text-foreground shrink-0">
                    {expense.currency} {Number(expense.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
              {expenses.length === 0 && (
                <p className="text-xs text-muted-foreground">Nenhuma despesa registrada.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {expenses.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <DollarSign className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nenhuma despesa registrada ainda.</p>
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
  color: 'blue' | 'green' | 'amber' | 'red';
}) {
  const colorMap = {
    blue: 'text-blue-400 bg-blue-500/10',
    green: 'text-green-400 bg-green-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    red: 'text-red-400 bg-red-500/10',
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-2">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colorMap[color])}>
        {icon}
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-base font-bold text-foreground leading-tight">{value}</p>
    </div>
  );
}
