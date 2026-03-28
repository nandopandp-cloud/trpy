'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  MapPin, Clock, DollarSign, Plus, Edit2, Trash2,
  Utensils, Hotel, Bus, Zap, MoreHorizontal, ChevronDown,
} from 'lucide-react';
import type { ItineraryDay as IDay, ItineraryItem } from '@trpy/database';
import { cn } from '@/lib/utils';

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; gradient: string; dot: string }
> = {
  ACTIVITY:   { label: 'Atividade',   icon: Zap,           gradient: 'from-emerald-500 to-teal-600', dot: 'bg-emerald-400' },
  RESTAURANT: { label: 'Restaurante', icon: Utensils,       gradient: 'from-amber-500 to-orange-500', dot: 'bg-amber-400' },
  HOTEL:      { label: 'Hotel',       icon: Hotel,          gradient: 'from-sky-500 to-blue-600',     dot: 'bg-sky-400' },
  TRANSPORT:  { label: 'Transporte',  icon: Bus,            gradient: 'from-violet-500 to-purple-600',dot: 'bg-violet-400' },
  OTHER:      { label: 'Outro',       icon: MoreHorizontal, gradient: 'from-slate-500 to-slate-600',  dot: 'bg-slate-400' },
};

interface ItineraryDayProps {
  day: IDay & { items: ItineraryItem[] };
  onAddItem: (dayId: string) => void;
  onEditItem: (item: ItineraryItem) => void;
  onDeleteItem: (itemId: string) => void;
}

export function ItineraryDay({ day, onAddItem, onEditItem, onDeleteItem }: ItineraryDayProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-border bg-card overflow-hidden shadow-card"
    >
      {/* Day header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setCollapsed(c => !c)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-ocean flex items-center justify-center shrink-0">
            <span className="text-sm font-black text-white">{day.dayNumber}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">
              {day.title ?? `Dia ${day.dayNumber}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(day.date), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {day.items.length > 0 && (
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {day.items.length} item{day.items.length !== 1 ? 's' : ''}
            </span>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onAddItem(day.id); }}
            className="w-7 h-7 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </motion.button>
          <motion.div animate={{ rotate: collapsed ? -90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </div>
      </div>

      {/* Items */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-1 border-t border-border pt-3">
              <AnimatePresence initial={false}>
                {day.items.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-8 text-center"
                  >
                    <div className="text-2xl mb-2">📅</div>
                    <p className="text-sm text-muted-foreground">Nenhuma atividade ainda.</p>
                    <button
                      onClick={() => onAddItem(day.id)}
                      className="mt-2 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      + Adicionar atividade
                    </button>
                  </motion.div>
                ) : (
                  day.items.map((item, idx) => (
                    <ItineraryItemRow
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
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ItineraryItemRow({
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
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="flex gap-3 group py-1"
    >
      {/* Timeline */}
      <div className="flex flex-col items-center pt-1 shrink-0">
        <div className={cn(
          'w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center',
          config.gradient
        )}>
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        {!isLast && <div className="w-px flex-1 mt-1.5 bg-border min-h-[12px]" />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-3 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
              {item.startTime && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {item.startTime}
                  {item.durationMins && ` · ${item.durationMins}min`}
                </span>
              )}
              {item.location && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground max-w-[180px] truncate">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{item.location}</span>
                </span>
              )}
              {item.cost && Number(item.cost) > 0 && (
                <span className="flex items-center gap-1 text-xs font-medium text-emerald-500">
                  <DollarSign className="w-3 h-3" />
                  {Number(item.cost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>

          {/* Actions — visible on hover */}
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 pt-0.5">
            <button
              onClick={onEdit}
              className="w-7 h-7 rounded-xl hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="w-7 h-7 rounded-xl hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
