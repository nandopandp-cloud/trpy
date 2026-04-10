'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Check, Loader2, Pencil, CalendarDays } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  rating: z.number().int().min(1, 'Selecione uma nota').max(5),
  title: z.string().max(120).optional(),
  body: z.string().max(2000).optional(),
  visitedOn: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface WriteReviewModalProps {
  googlePlaceId: string;
  placeName: string;
  /** If provided, we're editing an existing review */
  existing?: {
    id: string;
    rating: number;
    title?: string | null;
    body?: string | null;
    visitedOn?: Date | string | null;
  };
  onClose: () => void;
}

// ─── Star Picker ──────────────────────────────────────────────────────────────

const RATING_LABELS: Record<number, string> = {
  1: 'Péssimo',
  2: 'Ruim',
  3: 'Regular',
  4: 'Bom',
  5: 'Excelente',
};

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={cn(
                'w-8 h-8 transition-all duration-150',
                star <= display
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-muted-foreground/30',
              )}
            />
          </motion.button>
        ))}

        <AnimatePresence mode="wait">
          {display > 0 && (
            <motion.span
              key={display}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.15 }}
              className="ml-2 text-sm font-semibold text-foreground"
            >
              {RATING_LABELS[display]}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WriteReviewModal({
  googlePlaceId,
  placeName,
  existing,
  onClose,
}: WriteReviewModalProps) {
  const queryClient = useQueryClient();
  const isEdit = !!existing;

  const formatDate = (d: Date | string | null | undefined) => {
    if (!d) return '';
    const date = typeof d === 'string' ? new Date(d) : d;
    return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      rating: existing?.rating ?? 0,
      title: existing?.title ?? '',
      body: existing?.body ?? '',
      visitedOn: formatDate(existing?.visitedOn),
    },
  });

  const ratingValue = watch('rating');

  async function onSubmit(values: FormValues) {
    if (!values.rating || values.rating < 1) {
      toast.error('Selecione uma nota antes de publicar.');
      return;
    }

    const res = await fetch('/api/place-reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        googlePlaceId,
        placeName,
        rating: values.rating,
        title: values.title || undefined,
        body: values.body || undefined,
        visitedOn: values.visitedOn || undefined,
      }),
    });

    const json = await res.json();
    if (!json.success) throw new Error(json.error ?? 'Erro ao publicar avaliação');

    // Invalidate place reviews cache
    queryClient.invalidateQueries({ queryKey: ['place-reviews', googlePlaceId] });
    toast.success(isEdit ? 'Avaliação atualizada!' : 'Avaliação publicada!', {
      description: `${values.rating} estrela${values.rating !== 1 ? 's' : ''} em ${placeName}`,
    });
    onClose();
  }

  async function handleDelete() {
    if (!existing?.id) return;
    const res = await fetch(`/api/place-reviews/${existing.id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!json.success) {
      toast.error('Erro ao excluir avaliação');
      return;
    }
    queryClient.invalidateQueries({ queryKey: ['place-reviews', googlePlaceId] });
    toast.success('Avaliação excluída');
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 48, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 48, scale: 0.97 }}
        transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
        className="w-full sm:max-w-lg bg-card border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-amber-400/15 flex items-center justify-center">
              <Pencil className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">
                {isEdit ? 'Editar avaliação' : 'Escrever avaliação'}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1 max-w-[220px]">{placeName}</p>
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

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          <form id="review-form" onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">

            {/* Star rating */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Sua nota <span className="text-destructive">*</span>
              </label>
              <StarPicker
                value={ratingValue ?? 0}
                onChange={(v) => setValue('rating', v, { shouldValidate: true })}
              />
              {errors.rating && (
                <p className="text-xs text-destructive">{errors.rating.message}</p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Título{' '}
                <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
              </label>
              <Input
                {...register('title')}
                placeholder="Resumo da sua experiência"
                className="h-10"
              />
            </div>

            {/* Body */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Sua experiência{' '}
                <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
              </label>
              <textarea
                {...register('body')}
                rows={4}
                placeholder="O que você achou? Dicas para quem vai visitar, o que comeu, como foi o atendimento..."
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all resize-none"
              />
              <p className="text-[11px] text-muted-foreground text-right">
                {watch('body')?.length ?? 0}/2000
              </p>
              {errors.body && (
                <p className="text-xs text-destructive">{errors.body.message}</p>
              )}
            </div>

            {/* Visited on */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                Quando você visitou?{' '}
                <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
              </label>
              <Input
                {...register('visitedOn')}
                type="date"
                className="h-10"
              />
            </div>

            {/* Info note */}
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sua avaliação será publicada no Trpy e ficará visível para outros viajantes. Ela é diferente das avaliações do Google.
              </p>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border bg-muted/30 shrink-0 space-y-3">
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              className="w-full text-xs font-semibold text-destructive hover:text-destructive/80 transition-colors text-center py-1"
            >
              Excluir avaliação
            </button>
          )}
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11">
              Cancelar
            </Button>
            <Button
              type="submit"
              form="review-form"
              disabled={isSubmitting || !ratingValue}
              className="flex-1 h-11 font-semibold gap-2"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Publicando…</>
              ) : (
                <><Check className="w-4 h-4" /> {isEdit ? 'Salvar' : 'Publicar avaliação'}</>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
