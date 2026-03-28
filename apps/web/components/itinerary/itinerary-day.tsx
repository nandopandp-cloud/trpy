'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  MapPin, Clock, DollarSign, Plus, Edit2, Trash2,
  Utensils, Hotel, Bus, Zap, MoreHorizontal,
} from 'lucide-react';
import type { ItineraryDay as IDay, ItineraryItem, ItemType } from '@trpy/database';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  ACTIVITY: { label: 'Atividade', icon: Zap,        color: 'text-blue-400',   bg: 'bg-blue-500/20' },
  RESTAURANT:{ label: 'Restaurante', icon: Utensils, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  HOTEL:     { label: 'Hotel',       icon: Hotel,    color: 'text-green-400',  bg: 'bg-green-500/20' },
  TRANSPORT: { label: 'Transporte',  icon: Bus,      color: 'text-purple-400', bg: 'bg-purple-500/20' },
  OTHER:     { label: 'Outro',       icon: MoreHorizontal, color: 'text-slate-400', bg: 'bg-slate-500/20' },
};

interface ItineraryDayProps {
  day: IDay & { items: ItineraryItem[] };
  onAddItem: (dayId: string) => void;
  onEditItem: (item: ItineraryItem) => void;
  onDeleteItem: (itemId: string) => void;
}

export function ItineraryDay({ day, onAddItem, onEditItem, onDeleteItem }: ItineraryDayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card"
    >
      {/* Day header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">{day.dayNumber}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {day.title ?? `Dia ${day.dayNumber}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(day.date), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onAddItem(day.id)}
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar
        </Button>
      </div>

      {/* Items timeline */}
      <div className="p-3 space-y-1">
        <AnimatePresence initial={false}>
          {day.items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-6 text-center text-sm text-muted-foreground"
            >
              Nenhuma atividade ainda.
            </motion.div>
          ) : (
            day.items.map((item, idx) => (
              <ItineraryItem
                key={item.id}
                item={item}
                isLast={idx === day.items.length - 1}
                onEdit={() => onEditItem(item)}
                onDelete={() => onDeleteItem(item.id)}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function ItineraryItem({
  item,
  isLast,
  onEdit,
  onDelete,
}: {
  item: ItineraryItem;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.OTHER;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      className="flex gap-3 group"
    >
      {/* Timeline line */}
      <div className="flex flex-col items-center pt-1">
        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', config.bg)}>
          <Icon className={cn('w-3.5 h-3.5', config.color)} />
        </div>
        {!isLast && <div className="w-px flex-1 mt-1 bg-border min-h-[16px]" />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
              {item.startTime && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" /> {item.startTime}
                  {item.durationMins && ` (${item.durationMins}min)`}
                </span>
              )}
              {item.location && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground truncate max-w-[160px]">
                  <MapPin className="w-3 h-3 shrink-0" /> {item.location}
                </span>
              )}
              {item.cost && Number(item.cost) > 0 && (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <DollarSign className="w-3 h-3" /> {Number(item.cost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit}>
              <Edit2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
