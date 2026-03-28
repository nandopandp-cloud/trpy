'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit2, Trash2, ArrowRight, MapPin, Calendar, Wallet } from 'lucide-react';
import type { Trip } from '@trpy/database';
import { CardModern } from '@/components/ui/card-modern';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STATUS_LABEL: Record<string, string> = {
  PLANNING: 'Planejando',
  ONGOING: 'Em andamento',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
};

const STATUS_VARIANT: Record<string, string> = {
  PLANNING: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ONGOING: 'bg-green-500/20 text-green-400 border-green-500/30',
  COMPLETED: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

interface TripCardProps {
  trip: Trip;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TripCard({ trip, onClick, onEdit, onDelete }: TripCardProps) {
  const spent = Number(trip.totalSpent);
  const budget = Number(trip.budget);
  const progress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const progressColor =
    progress >= 90 ? 'from-red-500 to-orange-500' :
    progress >= 70 ? 'from-amber-500 to-yellow-500' :
    'from-blue-500 to-violet-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <CardModern
        hover={false}
        className="overflow-hidden cursor-pointer group"
        onClick={onClick}
      >
        {/* Cover */}
        <div className="relative h-36 overflow-hidden">
          {trip.coverImage ? (
            <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-600 via-violet-600 to-purple-700" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-3 right-3">
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full border',
                STATUS_VARIANT[trip.status]
              )}
            >
              {STATUS_LABEL[trip.status]}
            </span>
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-white font-bold text-base truncate">{trip.title}</h3>
            <div className="flex items-center gap-1 text-white/80 text-xs mt-0.5">
              <MapPin className="w-3 h-3" />
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

          {/* Budget progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Wallet className="w-3.5 h-3.5" />
                <span>Orçamento</span>
              </div>
              <span className="text-foreground font-medium">
                {trip.currency} {spent.toLocaleString('pt-BR')}
                <span className="text-muted-foreground font-normal">
                  {' / '}{budget.toLocaleString('pt-BR')}
                </span>
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn('h-full rounded-full bg-gradient-to-r', progressColor)}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={(e) => { e.stopPropagation(); onEdit?.(); }}
            >
              <Edit2 className="w-3 h-3 mr-1" /> Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => { e.stopPropagation(); onClick?.(); }}
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardModern>
    </motion.div>
  );
}
