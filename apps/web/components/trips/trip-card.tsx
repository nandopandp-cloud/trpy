'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Calendar, ArrowRight, Wallet } from 'lucide-react';
import type { Trip } from '@trpy/database';
import { cn } from '@/lib/utils';
import { useLocale, t, formatNumber } from '@/lib/i18n';

const STATUS_STYLE: Record<string, string> = {
  PLANNING: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20',
  ONGOING: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/20',
  COMPLETED: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-500/15 dark:text-zinc-400 dark:border-zinc-500/20',
  CANCELLED: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/20',
};

type EffectiveStatus = 'PLANNING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

function deriveStatus(trip: Trip): EffectiveStatus {
  if (trip.status === 'CANCELLED') return 'CANCELLED';
  const now = new Date();
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  if (now > end) return 'COMPLETED';
  if (now >= start && now <= end) return 'ONGOING';
  return 'PLANNING';
}

const GRADIENT_FALLBACKS = [
  'from-indigo-600 via-violet-600 to-purple-700',
  'from-sky-600 via-blue-600 to-indigo-700',
  'from-emerald-600 via-teal-600 to-cyan-700',
  'from-amber-600 via-orange-500 to-red-600',
  'from-rose-600 via-pink-600 to-fuchsia-700',
];

interface TripCardProps {
  trip: Trip;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  index?: number;
}

export function TripCard({ trip, onClick, onEdit, onDelete, index = 0 }: TripCardProps) {
  const [locale] = useLocale();

  const STATUS_LABEL: Record<string, string> = {
    PLANNING: t(locale, 'status.planning'),
    ONGOING: t(locale, 'status.ongoing'),
    COMPLETED: t(locale, 'status.completed'),
    CANCELLED: t(locale, 'status.cancelled'),
  };

  const spent = Number(trip.totalSpent);
  const budget = Number(trip.budget);
  const progress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const daysLeft = differenceInDays(new Date(trip.startDate), new Date());
  const fallback = GRADIENT_FALLBACKS[index % GRADIENT_FALLBACKS.length];
  const effectiveStatus = deriveStatus(trip);

  const progressColor =
    progress >= 90 ? 'from-red-500 to-orange-400' :
    progress >= 70 ? 'from-amber-500 to-yellow-400' :
    'from-indigo-500 to-violet-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <div className="rounded-2xl overflow-hidden bg-card border border-border shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 group-hover:border-primary/20">
        {/* Cover image */}
        <div className="relative h-44 overflow-hidden">
          {trip.coverImage ? (
            <Image
              src={trip.coverImage}
              alt={trip.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className={cn('w-full h-full bg-gradient-to-br relative', fallback)}>
              <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
            <span className={cn(
              'inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border backdrop-blur-sm',
              STATUS_STYLE[effectiveStatus]
            )}>
              {effectiveStatus === 'ONGOING' && (
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
              )}
              {STATUS_LABEL[effectiveStatus]}
            </span>
            {effectiveStatus === 'PLANNING' && daysLeft > 0 && (
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-black/40 text-white/90 border border-white/15 backdrop-blur-sm">
                {daysLeft}d
              </span>
            )}
          </div>

          {/* Bottom info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-medium text-lg leading-tight line-clamp-1 tracking-tight">{trip.title}</h3>
            <div className="flex items-center gap-1 mt-1 text-white/75 text-xs">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{trip.destination}</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Dates */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {format(new Date(trip.startDate), "d MMM", { locale: ptBR })}
              {' — '}
              {format(new Date(trip.endDate), "d MMM yyyy", { locale: ptBR })}
            </span>
          </div>

          {/* Budget */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Wallet className="w-3.5 h-3.5" />
                {t(locale, 'budget.total')}
              </span>
              <span className="font-medium text-foreground">
                {trip.currency} {formatNumber(locale, spent)}
                <span className="text-muted-foreground font-normal"> / {formatNumber(locale, budget)}</span>
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn('h-full rounded-full bg-gradient-to-r', progressColor)}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between pt-0.5">
            <div className="flex gap-2">
              {onEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit(); }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted"
                >
                  {t(locale, 'common.edit')}
                </button>
              )}
            </div>
            <motion.button
              whileHover={{ x: 2 }}
              onClick={(e) => { e.stopPropagation(); onClick?.(); }}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors group relative overflow-hidden px-3 py-1.5 rounded-full hover:bg-primary/5"
            >
              <span className="relative z-10 flex items-center gap-1.5">{t(locale, 'common.details')} <ArrowRight className="w-3.5 h-3.5" /></span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
