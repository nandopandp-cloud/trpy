'use client';

import { useState, useCallback, useEffect, memo } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Home, Utensils, Bus, Zap, ShoppingBag, Heart, MoreHorizontal,
  X, Loader2, Check, Edit2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useLocale, t, CURRENCIES, getCurrencySymbolByCode } from '@/lib/i18n';
import type { Expense } from '@trpy/database';

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

type FormValues = z.input<typeof schema>;

interface ExpenseFormProps {
  tripId: string;
  /** When provided, form enters edit mode */
  expense?: Expense;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ExpenseForm = memo(function ExpenseForm({ tripId, expense, onClose, onSuccess }: ExpenseFormProps) {
  const isEditMode = !!expense;
  const [selectedCategory, setSelectedCategory] = useState<string>(expense?.category ?? 'OTHER');
  const [locale] = useLocale();
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: (expense?.category as any) ?? 'OTHER',
      currency: expense?.currency ?? 'BRL',
      date: expense?.date
        ? format(new Date(expense.date), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd'),
      title: expense?.title ?? '',
      amount: expense?.amount ? Number(expense.amount) : undefined,
      notes: expense?.notes ?? '',
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
    const scrollable = document.querySelector('main');
    if (scrollable) (scrollable as HTMLElement).style.overflow = 'hidden';
    return () => {
      if (scrollable) (scrollable as HTMLElement).style.overflow = '';
    };
  }, []);

  async function onSubmit(values: FormValues) {
    try {
      const payload = {
        ...values,
        date: new Date(values.date).toISOString(),
      };

      let res: Response;
      if (isEditMode && expense) {
        res = await fetch(`/api/expenses/${expense.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`/api/trips/${tripId}/expenses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });

      if (isEditMode) {
        toast.success('Despesa atualizada!', {
          description: `${values.title} — ${getCurrencySymbolByCode(values.currency ?? 'BRL')} ${values.amount}`,
        });
      } else {
        toast.success(t(locale, 'expense.success'), {
          description: `${values.title} — ${getCurrencySymbolByCode(values.currency ?? 'BRL')} ${values.amount}`,
        });
      }

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
          <div className="flex items-center gap-2.5">
            {isEditMode && (
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Edit2 className="w-4 h-4 text-primary" />
              </div>
            )}
            <h3 className="font-bold text-lg">
              {isEditMode ? 'Editar despesa' : t(locale, 'expense.new')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground active:scale-90 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto flex-1 p-6 space-y-5">
          {/* Category picker */}
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
                  {getCurrencySymbolByCode(selectedCurrency ?? 'BRL')}
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
            className="w-full gap-2 h-11 text-base font-semibold"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> {t(locale, 'common.saving')}</>
            ) : isEditMode ? (
              <><Check className="w-4 h-4" /> Salvar alterações</>
            ) : (
              <><Check className="w-4 h-4" /> {t(locale, 'expense.submit')}</>
            )}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );

  if (!portalRoot) return null;
  return createPortal(modal, portalRoot);
});
