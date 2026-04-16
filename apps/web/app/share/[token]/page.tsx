'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  MapPin, Calendar, Wallet, Clock, Navigation,
  Utensils, Hotel, Bus, Zap, MoreHorizontal,
  ChevronDown, Home, ShoppingBag, Heart,
  AlertCircle, Plane, DollarSign, Globe,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/* ── Types ─────────────────────────────────────────────────────────────────── */

interface PublicItem {
  id: string; type: string; title: string; description?: string | null;
  location?: string | null; startTime?: string | null; durationMins?: number | null;
  cost?: string | number | null; currency?: string | null; order: number;
}
interface PublicDay {
  id: string; dayNumber: number; date: string; title?: string | null;
  items: PublicItem[];
}
interface PublicExpense {
  id: string; title: string; amount: string | number;
  currency: string; category: string; date: string; notes?: string | null;
}
interface PublicTrip {
  id: string; title: string; destination: string; description?: string | null;
  coverImage?: string | null; startDate: string; endDate: string;
  budget: string | number; totalSpent: string | number; currency: string;
  status: string;
  user: { name: string | null; image: string | null };
  itineraryDays: PublicDay[];
  expenses: PublicExpense[];
}

/* ── Config ─────────────────────────────────────────────────────────────────── */

const ITEM_TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  ACTIVITY:   { icon: Zap,            color: 'text-emerald-400', bg: 'bg-emerald-500/15', label: 'Atividade' },
  RESTAURANT: { icon: Utensils,       color: 'text-amber-400',   bg: 'bg-amber-500/15',   label: 'Restaurante' },
  HOTEL:      { icon: Hotel,          color: 'text-sky-400',     bg: 'bg-sky-500/15',     label: 'Hospedagem' },
  TRANSPORT:  { icon: Bus,            color: 'text-violet-400',  bg: 'bg-violet-500/15',  label: 'Transporte' },
  OTHER:      { icon: MoreHorizontal, color: 'text-slate-400',   bg: 'bg-slate-500/15',   label: 'Outro' },
};

const EXPENSE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  ACCOMMODATION: { icon: Home,          color: 'text-blue-400',    bg: 'bg-blue-500/15',    label: 'Hospedagem' },
  FOOD:          { icon: Utensils,      color: 'text-amber-400',   bg: 'bg-amber-500/15',   label: 'Alimentação' },
  TRANSPORT:     { icon: Bus,           color: 'text-violet-400',  bg: 'bg-violet-500/15',  label: 'Transporte' },
  ACTIVITIES:    { icon: Zap,           color: 'text-emerald-400', bg: 'bg-emerald-500/15', label: 'Atividades' },
  SHOPPING:      { icon: ShoppingBag,   color: 'text-rose-400',    bg: 'bg-rose-500/15',    label: 'Compras' },
  HEALTH:        { icon: Heart,         color: 'text-red-400',     bg: 'bg-red-500/15',     label: 'Saúde' },
  OTHER:         { icon: MoreHorizontal,color: 'text-slate-400',   bg: 'bg-slate-500/15',   label: 'Outros' },
};

const STATUS_LABEL: Record<string, { label: string; class: string }> = {
  PLANNING:  { label: 'Planejando',    class: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  ONGOING:   { label: 'Em andamento',  class: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  COMPLETED: { label: 'Concluída',     class: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  CANCELLED: { label: 'Cancelada',     class: 'bg-red-500/20 text-red-300 border-red-500/30' },
};

/* ── Stagger variants ───────────────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { ease: [0.16, 1, 0.3, 1], duration: 0.55 } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

/* ── Day card ────────────────────────────────────────────────────────────────── */

function DayCard({ day, index }: { day: PublicDay; index: number }) {
  const [open, setOpen] = useState(index === 0);

  return (
    <motion.div variants={fadeUp} className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="w-10 h-10 rounded-2xl bg-primary/80 flex items-center justify-center shrink-0 shadow">
          <span className="text-sm font-black text-white">{day.dayNumber}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white leading-tight">
            {day.title ?? `Dia ${day.dayNumber}`}
          </p>
          <p className="text-xs text-white/50 capitalize mt-0.5">
            {format(new Date(day.date), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {day.items.length > 0 && (
            <span className="text-[11px] font-semibold text-white/40 bg-white/10 px-2 py-0.5 rounded-full">
              {day.items.length}
            </span>
          )}
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-white/40" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10 px-5 pt-4 pb-5">
              {day.items.length === 0 ? (
                <p className="text-xs text-white/30 italic py-2">Nenhuma atividade planejada</p>
              ) : (
                <div className="space-y-0.5">
                  {day.items.map((item, idx) => {
                    const cfg = ITEM_TYPE_CONFIG[item.type] ?? ITEM_TYPE_CONFIG.OTHER;
                    const Icon = cfg.icon;
                    const isLast = idx === day.items.length - 1;
                    return (
                      <div key={item.id} className="flex gap-3 py-2">
                        <div className="flex flex-col items-center shrink-0">
                          <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', cfg.bg)}>
                            <Icon className={cn('w-3.5 h-3.5', cfg.color)} />
                          </div>
                          {!isLast && <div className="w-px flex-1 mt-1.5 bg-white/10 min-h-[14px]" />}
                        </div>
                        <div className={cn('flex-1 min-w-0', !isLast && 'pb-3')}>
                          <p className="text-sm font-semibold text-white leading-snug">{item.title}</p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            {item.startTime && (
                              <span className="flex items-center gap-1 text-xs text-white/50">
                                <Clock className="w-3 h-3 shrink-0" />
                                {item.startTime}
                                {item.durationMins && <span className="text-white/30">· {item.durationMins}min</span>}
                              </span>
                            )}
                            {item.location && (
                              <span className="flex items-center gap-1 text-xs text-white/50 max-w-[200px]">
                                <Navigation className="w-3 h-3 shrink-0" />
                                <span className="truncate">{item.location}</span>
                              </span>
                            )}
                            {item.cost != null && Number(item.cost) > 0 && (
                              <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-400">
                                <DollarSign className="w-3 h-3" />
                                {item.currency ?? ''} {Number(item.cost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-xs text-white/35 mt-1 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Main page ───────────────────────────────────────────────────────────────── */

export default function SharedTripPage() {
  const params = useParams<{ token: string }>();
  const [trip, setTrip] = useState<PublicTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expensesOpen, setExpensesOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/share/${params.token}`)
      .then(r => r.json())
      .then(json => {
        if (!json.success) throw new Error(json.error ?? 'Não encontrado');
        setTrip(json.data);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [params.token]);

  /* Loading */
  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent"
      />
    </div>
  );

  /* Error */
  if (error || !trip) return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4"
      >
        <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7 text-white/30" />
        </div>
        <h1 className="text-xl font-bold text-white">Planejamento não encontrado</h1>
        <p className="text-sm text-white/40 max-w-xs">
          Este link pode ter sido desativado pelo dono ou não existe mais.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <Plane className="w-4 h-4" />
          Conhecer o TRPY
        </Link>
      </motion.div>
    </div>
  );

  /* Data */
  const budget = Number(trip.budget);
  const spent = Number(trip.totalSpent);
  const remaining = budget - spent;
  const progress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const totalDays = trip.itineraryDays.length;
  const totalItems = trip.itineraryDays.reduce((s, d) => s + d.items.length, 0);
  const statusCfg = STATUS_LABEL[trip.status] ?? STATUS_LABEL.PLANNING;

  // group expenses by category
  const expByCategory = trip.expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + Number(e.amount);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Background image or gradient */}
        {trip.coverImage ? (
          <div className="absolute inset-0">
            <img src={trip.coverImage} alt="" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-[#0a0a0f]" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-[#0a0a0f]" />
        )}

        {/* Subtle noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }}
        />

        <div className="relative px-5 pt-12 pb-10 max-w-2xl mx-auto">
          {/* TRPY badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between mb-8"
          >
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Globe className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-xs font-bold text-white/40 group-hover:text-white/70 transition-colors tracking-wider uppercase">TRPY</span>
            </Link>
            <span className={cn('text-[11px] font-semibold px-2.5 py-1 rounded-full border', statusCfg.class)}>
              {statusCfg.label}
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
            className="text-3xl sm:text-4xl font-bold text-white leading-tight tracking-tight"
          >
            {trip.title}
          </motion.h1>

          {/* Meta row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center gap-3 mt-3"
          >
            <span className="flex items-center gap-1.5 text-sm text-white/60">
              <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
              {trip.destination}
            </span>
            {trip.startDate && (
              <span className="flex items-center gap-1.5 text-sm text-white/60">
                <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                {format(new Date(trip.startDate), "d MMM", { locale: ptBR })}
                {trip.endDate && ` → ${format(new Date(trip.endDate), "d MMM yyyy", { locale: ptBR })}`}
              </span>
            )}
          </motion.div>

          {trip.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-white/50 mt-3 leading-relaxed max-w-lg"
            >
              {trip.description}
            </motion.p>
          )}

          {/* Author */}
          {trip.user.name && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="flex items-center gap-2 mt-4"
            >
              {trip.user.image ? (
                <img src={trip.user.image} alt={trip.user.name} className="w-6 h-6 rounded-full object-cover ring-1 ring-white/20" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary">{trip.user.name[0]}</span>
                </div>
              )}
              <span className="text-xs text-white/40">
                Planejamento de <span className="text-white/60 font-medium">{trip.user.name}</span>
              </span>
            </motion.div>
          )}

          {/* Stats chips */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-2 mt-6"
          >
            {[
              { label: `${totalDays} dia${totalDays !== 1 ? 's' : ''}`, icon: Calendar },
              { label: `${totalItems} atividade${totalItems !== 1 ? 's' : ''}`, icon: Zap },
              ...(trip.expenses.length > 0 ? [{ label: `${trip.expenses.length} despesa${trip.expenses.length !== 1 ? 's' : ''}`, icon: Wallet }] : []),
            ].map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/8 border border-white/10 text-xs font-medium text-white/60">
                <Icon className="w-3 h-3" />
                {label}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-5 pb-24 space-y-8">

        {/* Budget card */}
        {budget > 0 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="rounded-3xl border border-white/10 bg-white/5 p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-bold text-white">Orçamento</p>
              <span className={cn(
                'ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full',
                progress >= 100 ? 'bg-red-500/20 text-red-400' :
                progress >= 80  ? 'bg-amber-500/20 text-amber-400' :
                'bg-emerald-500/20 text-emerald-400'
              )}>
                {progress.toFixed(0)}% usado
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
                className={cn(
                  'h-full rounded-full bg-gradient-to-r',
                  progress >= 90 ? 'from-red-500 to-orange-400' :
                  progress >= 70 ? 'from-amber-500 to-yellow-400' :
                  'from-emerald-500 to-teal-400'
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Orçamento', value: budget, color: 'text-white' },
                { label: 'Gasto',     value: spent,   color: progress >= 90 ? 'text-red-400' : 'text-white' },
                { label: 'Saldo',     value: Math.abs(remaining), color: remaining < 0 ? 'text-red-400' : 'text-emerald-400' },
              ].map(stat => (
                <div key={stat.label} className="bg-white/5 rounded-2xl px-3 py-3 text-center">
                  <p className={cn('text-sm font-bold tabular-nums', stat.color)}>
                    {remaining < 0 && stat.label === 'Saldo' && '−'}
                    {stat.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-[10px] text-white/30 mt-0.5">{trip.currency} · {stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Itinerary */}
        {trip.itineraryDays.length > 0 && (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-primary" />
              <h2 className="text-base font-bold text-white">Itinerário</h2>
              <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{totalDays} dia{totalDays !== 1 ? 's' : ''}</span>
            </motion.div>

            {trip.itineraryDays.map((day, i) => (
              <DayCard key={day.id} day={day} index={i} />
            ))}
          </motion.div>
        )}

        {/* Expenses summary */}
        {trip.expenses.length > 0 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden"
          >
            <button
              onClick={() => setExpensesOpen(!expensesOpen)}
              className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Despesas</p>
                <p className="text-xs text-white/40 mt-0.5">
                  {trip.expenses.length} lançamento{trip.expenses.length !== 1 ? 's' : ''} · {trip.currency} {spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <motion.div animate={{ rotate: expensesOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4 text-white/30" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {expensesOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden border-t border-white/10"
                >
                  {/* Category totals */}
                  <div className="px-5 pt-4 pb-2">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Object.entries(expByCategory)
                        .sort((a, b) => b[1] - a[1])
                        .map(([cat, total]) => {
                          const cfg = EXPENSE_CONFIG[cat] ?? EXPENSE_CONFIG.OTHER;
                          return (
                            <div key={cat} className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-white/10', cfg.bg, cfg.color)}>
                              <span>{cfg.label}</span>
                              <span className="font-bold text-white/60">{trip.currency} {total.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
                            </div>
                          );
                        })}
                    </div>

                    {/* Expense list */}
                    <div className="space-y-1 pb-3">
                      {trip.expenses.map(e => {
                        const cfg = EXPENSE_CONFIG[e.category] ?? EXPENSE_CONFIG.OTHER;
                        const Icon = cfg.icon;
                        return (
                          <div key={e.id} className="flex items-center gap-3 py-2">
                            <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', cfg.bg)}>
                              <Icon className={cn('w-3.5 h-3.5', cfg.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white truncate">{e.title}</p>
                              <p className="text-[10px] text-white/30">
                                {format(new Date(e.date), 'd MMM', { locale: ptBR })}
                                {e.notes && ` · ${e.notes}`}
                              </p>
                            </div>
                            <p className="text-xs font-bold text-white shrink-0">
                              {e.currency} {Number(e.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-violet-500/5 p-6 text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <Plane className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Planeje a sua viagem</h3>
          <p className="text-sm text-white/40 mb-4 max-w-xs mx-auto">
            Use o TRPY para organizar itinerário, orçamento e muito mais — de graça.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/25"
          >
            Começar agora
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
