'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Calendar, ArrowRight, Wallet } from 'lucide-react';
import type { Trip } from '@trpy/database';
import { cn } from '@/lib/utils';
import { useLocale, formatNumber } from '@/lib/i18n';
import { deriveStatus, STATUS_LABEL, STATUS_BADGE_DARK } from '@/lib/trip-status';

const GRADIENT_FALLBACKS = [
  'from-emerald-700 via-teal-700 to-cyan-800',
  'from-violet-700 via-purple-700 to-indigo-800',
  'from-rose-700 via-pink-700 to-fuchsia-800',
  'from-amber-700 via-orange-600 to-red-700',
];

interface HeroCardProps {
  trip: Trip;
  onClick?: () => void;
  className?: string;
}

export function HeroCard({ trip, onClick, className }: HeroCardProps) {
  const [locale] = useLocale();
  const budget = Number(trip.budget);
  const spent = Number(trip.totalSpent);
  const progress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const gradient = GRADIENT_FALLBACKS[trip.id.charCodeAt(0) % GRADIENT_FALLBACKS.length];
  const effectiveStatus = deriveStatus(trip);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn('relative rounded-3xl overflow-hidden cursor-pointer group shadow-card-xl', className)}
    >
      {/* Background */}
      <div className="relative h-64 md:h-80">
        {trip.coverImage ? (
          <Image
            src={trip.coverImage}
            alt={trip.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 66vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className={cn('w-full h-full bg-gradient-to-br', gradient)} />
        )}
        <div className="absolute inset-0 hero-overlay" />

        {/* Status badge */}
        <div className="absolute top-4 left-4">
          <span className={cn(
            'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border',
            STATUS_BADGE_DARK[effectiveStatus]
          )}>
            {effectiveStatus === 'ONGOING' && (
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
              </span>
            )}
            {STATUS_LABEL[effectiveStatus]}
          </span>
        </div>

        {/* Content at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          {/* Title & location */}
          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">
            {trip.title}
          </h2>
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="flex items-center gap-1.5 text-white/80 text-sm">
              <MapPin className="w-3.5 h-3.5" /> {trip.destination}
            </span>
            <span className="flex items-center gap-1.5 text-white/80 text-sm">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(trip.startDate), "d MMM", { locale: ptBR })}
              {' — '}
              {format(new Date(trip.endDate), "d MMM yyyy", { locale: ptBR })}
            </span>
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Wallet className="w-4 h-4 text-white/60 shrink-0" />
              <div className="flex-1">
                <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className={cn(
                      'h-full rounded-full bg-gradient-to-r',
                      progress >= 90 ? 'from-red-400 to-orange-400' :
                      progress >= 70 ? 'from-amber-400 to-yellow-300' :
                      'from-emerald-400 to-teal-300'
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut', delay: 0.3 }}
                  />
                </div>
              </div>
              <span className="text-xs font-semibold text-white/80 shrink-0">
                {trip.currency} {formatNumber(locale, spent)}
                <span className="text-white/50 font-normal"> / {formatNumber(locale, budget)}</span>
              </span>
            </div>

            <motion.div
              whileHover={{ x: 3 }}
              className="flex items-center gap-1.5 text-white text-sm font-semibold shrink-0"
            >
              Ver detalhes <ArrowRight className="w-4 h-4" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
