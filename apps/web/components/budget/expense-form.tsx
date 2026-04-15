'use client';

import { useState, useCallback, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Home, Utensils, Bus, Zap, ShoppingBag, Heart, MoreHorizontal,
  X, Loader2, Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useLocale, t, CURRENCIES, getCurrencySymbolByCode } from '@/lib/i18n';

const CATEGORIES = [
  { value: 'ACCOMMODATION', labelKey: 'category.accommodation', icon: Home,         bg: 'bg-blue-500/15 border-blue-500/30',    active: 'bg-blue-500 border-blue-500' },
  { value: 'FOOD',          labelKey: 'category.food',          icon: Utensils,    bg: 'bg-amber-500/15 border-amber-500/30',  active: 'bg-amber-500 border-amber-500' },
  { value: 'TRANSPORT',     labelKey: 'category.transport',     icon: Bus,         bg: 'bg-violet-500/15 border-violet-500/30',active: 'bg-violet-500 border-violet-500' },
  { value: 'ACTIVITIES',    labelKey: 'category.activities',    icon: Zap,         bg: 'bg-emerald-500/15 border-emerald-500/30', active: 'bg-emerald-500 border-emerald-500' },
  { value: 'SHOPPING',      labelKey: 'category.shopping',      icon: ShoppingBag, bg: 'bg-rose-500/15 border-rose-500/30',    active: 'bg-rose-500 border-rose-500' },
  { value: 'HEALTH',        labelKey: 'category.health',        icon: Heart,       bg: 'bg-red-500/15 border-red-500/30',      active: 'bg-red-500 border-red-500' },
  { value: 'OTHER',         labelKey: 'category.other',         icon: MoreHorizontal, bg: 'bg-slate-500/15 border-slate-500/30', active: 'bg-slate-500 border-slate-500' },
] as const;

const schema = z.object({
  title: z.string().min(1, 'Título obrigatório').max(200),
  amount: z.coerce.number().positive('Valor deve ser maior que 0'),
  currency: z.string().length(3).default('BRL'),
  category: z.enum(['ACCOMMODATION','FOOD','TRANSPORT','ACTIVITIES','SHOPPING','HEALTH','OTHER']),
  date: z.string().min(1, 'Data obrigatória'),
  notes: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

interface ExpenseFormProps {
  tripId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ExpenseForm = memo(function ExpenseForm({ tripId, onClose, onSuccess }: ExpenseFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('OTHER');
  const [locale] = useLocale();
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, setError, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      category: 'OTHER',
      currency: 'BRL',
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const selectedCurrency = watch('currency');

  const selectCategory = useCallback((value: string) => {
    setSelectedCategory(value);
    setValue('category', value as any);
  }, [setValue]);

  // Portal target + body scroll lock
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setPortalRoot(document.body);
    // Lock scroll on the page behind
    const scrollable = document.querySelector('main');
    if (scrollable) (scrollable as HTMLElement).style.overflow = 'hidden';
    return () => {
      if (scrollable) (scrollable as HTMLElement).style.overflow = '';
    };
  }, []);

  async function onSubmit(values: FormValues) {
    try {
      const result = schema.safeParse(values);
      if (!result.success) {
        for (const issue of result.error.issues) {
          const field = issue.path[0] as keyof FormValues;
          if (field) setError(field, { message: issue.message });
        }
        return;
      }
      const validated = result.data;
      const res = await fetch(`/api/trips/${tripId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...validated,
          date: new Date(validated.date).toISOString(),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      toast.success(t(locale, 'expense.success'), { description: `${validated.title} — ${getCurrencySymbolByCode(validated.currency)} ${validated.amount}` });
      onSuccess?.();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : t(locale, 'expense.error');
      toast.error(message);
    }
  }

  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      /* Block ALL touch propagation to the page behind */
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
        className="w-full sm:max-w-md bg-card border border-border rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90dvh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
          <h3 className="font-bold text-lg">{t(locale, 'expense.new')}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-90 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Category picker — simple CSS, no layoutId */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t(locale, 'expense.category')}</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const active = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => selectCategory(cat.value)}
                    className={cn(
                      'relative flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-colors duration-150',
                      active ? cn(cat.active, 'text-white') : cn(cat.bg, 'text-muted-foreground hover:text-foreground')
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[9px] font-medium leading-tight text-center">
                      {t(locale, cat.labelKey)}
                    </span>
                    {active && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow">
                        <Check className="w-2.5 h-2.5 text-green-600" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t(locale, 'expense.description')}</label>
            <Input placeholder={t(locale, 'expense.description_placeholder')} {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Amount + Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t(locale, 'expense.amount')}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                  {getCurrencySymbolByCode(selectedCurrency)}
                </span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  className="pl-9"
                  {...register('amount')}
                />
              </div>
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t(locale, 'expense.currency')}</label>
              <select
                {...register('currency')}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} {c.symbol}</option>
                ))}
              </select>
              {errors.currency && <p className="text-xs text-destructive">{errors.currency.message}</p>}
            </div>
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">{t(locale, 'expense.date')}</label>
            <Input type="date" {...register('date')} />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              {t(locale, 'expense.notes')} <span className="text-muted-foreground font-normal">({t(locale, 'common.optional')})</span>
            </label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder={t(locale, 'expense.notes_placeholder')}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full gap-2 h-11 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 border-0 shadow-md shadow-primary/20"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {t(locale, 'common.saving')}</>
            ) : (
              <><Check className="w-4 h-4" /> {t(locale, 'expense.submit')}</>
            )}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );

  // Render via portal so the modal lives outside the scrollable <main>
  if (!portalRoot) return null;
  return createPortal(modal, portalRoot);
});
