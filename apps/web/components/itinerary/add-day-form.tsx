'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { X, Loader2, Check, CalendarDays } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const schema = z.object({
  date: z.string().min(1, 'Data obrigatória'),
  title: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

interface AddDayFormProps {
  tripId: string;
  nextDayNumber: number;
  onClose: () => void;
}

export function AddDayForm({ tripId, nextDayNumber, onClose }: AddDayFormProps) {
  const queryClient = useQueryClient();


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: format(new Date(), 'yyyy-MM-dd'),
      title: '',
      notes: '',
    },
  });

  async function onSubmit(values: FormValues) {
    const res = await fetch(`/api/trips/${tripId}/itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dayNumber: nextDayNumber,
        date: new Date(values.date).toISOString(),
        title: values.title || undefined,
        notes: values.notes || undefined,
      }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error ?? 'Erro ao adicionar dia');

    queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    toast.success(`Dia ${nextDayNumber} adicionado!`);
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.96 }}
        transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
        className="w-full sm:max-w-sm bg-card border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">Adicionar dia</p>
              <p className="text-xs text-muted-foreground">Dia {nextDayNumber} do itinerário</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Data <span className="text-destructive">*</span>
            </label>
            <Input
              type="date"
              {...register('date')}
              className="h-10"
            />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Título do dia{' '}
              <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
            </label>
            <Input
              {...register('title')}
              placeholder="Ex: Chegada em Paris"
              className="h-10"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Notas{' '}
              <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
            </label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="Observações gerais do dia..."
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all resize-none"
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 h-11 font-semibold gap-2">
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Salvando…</>
              ) : (
                <><Check className="w-4 h-4" /> Adicionar dia</>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
