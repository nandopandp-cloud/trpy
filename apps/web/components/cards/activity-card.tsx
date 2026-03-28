'use client';

import { motion } from 'framer-motion';
import { Clock, MapPin, DollarSign, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityCardProps {
  title: string;
  type: string;
  location?: string;
  time?: string;
  duration?: number;
  cost?: number;
  currency?: string;
  description?: string;
  typeGradient?: string;
  typeEmoji?: string;
  onClick?: () => void;
  index?: number;
}

const TYPE_MAP: Record<string, { emoji: string; gradient: string; label: string }> = {
  ACTIVITY:   { emoji: '⚡', gradient: 'from-emerald-500 to-teal-600', label: 'Atividade' },
  RESTAURANT: { emoji: '🍽️', gradient: 'from-amber-500 to-orange-500', label: 'Restaurante' },
  HOTEL:      { emoji: '🏨', gradient: 'from-sky-500 to-blue-600', label: 'Hotel' },
  TRANSPORT:  { emoji: '🚌', gradient: 'from-violet-500 to-purple-600', label: 'Transporte' },
  OTHER:      { emoji: '📌', gradient: 'from-slate-500 to-slate-600', label: 'Outro' },
};

export function ActivityCard({
  title,
  type,
  location,
  time,
  duration,
  cost,
  currency = 'R$',
  description,
  onClick,
  index = 0,
}: ActivityCardProps) {
  const meta = TYPE_MAP[type] ?? TYPE_MAP.OTHER;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      whileHover={{ x: 3 }}
      onClick={onClick}
      className={cn(
        'flex items-start gap-4 p-4 rounded-2xl border border-border bg-card cursor-pointer',
        'hover:border-primary/30 hover:shadow-card transition-all duration-200 group'
      )}
    >
      {/* Icon */}
      <div className={cn(
        'w-10 h-10 rounded-2xl bg-gradient-to-br flex items-center justify-center shrink-0',
        meta.gradient
      )}>
        <span className="text-lg">{meta.emoji}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{title}</p>
            <span className="text-[11px] font-medium text-muted-foreground">{meta.label}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
        </div>

        {description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1 leading-relaxed">{description}</p>
        )}

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-3 mt-2">
          {time && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {time}{duration ? ` · ${duration}min` : ''}
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground max-w-[160px] truncate">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{location}</span>
            </span>
          )}
          {cost != null && cost > 0 && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
              <DollarSign className="w-3 h-3" />
              {currency} {cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
