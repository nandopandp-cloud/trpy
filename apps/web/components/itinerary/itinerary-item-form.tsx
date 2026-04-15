'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Loader2, Check, Zap, Utensils, Hotel, Bus, MoreHorizontal,
  MapPin, Clock, DollarSign, FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLocale, t, CURRENCIES, getCurrencySymbolByCode } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import type { ItineraryItem } from '@trpy/database';

// ─── Item types ───────────────────────────────────────────────────────────────

const ITEM_TYPES = [
  {
    value: 'ACTIVITY',
    labelKey: 'item_type.activity' as const,
    icon: Zap,
    gradient: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-500/12 border-emerald-500/30',
    active: 'bg-gradient-to-br from-emerald-500 to-teal-600 border-transparent',
  },
  {
    value: 'RESTAURANT',
    labelKey: 'item_type.restaurant' as const,
    icon: Utensils,
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-500/12 border-amber-500/30',
    active: 'bg-gradient-to-br from-amber-500 to-orange-500 border-transparent',
  },
  {
    value: 'HOTEL',
    labelKey: 'item_type.hotel' as const,
    icon: Hotel,
    gradient: 'from-sky-500 to-blue-600',
    bg: 'bg-sky-500/12 border-sky-500/30',
    active: 'bg-gradient-to-br from-sky-500 to-blue-600 border-transparent',
  },
  {
    value: 'TRANSPORT',
    labelKey: 'item_type.transport' as const,
    icon: Bus,
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-500/12 border-violet-500/30',
    active: 'bg-gradient-to-br from-violet-500 to-purple-600 border-transparent',
  },
  {
    value: 'OTHER',
    labelKey: 'item_type.other' as const,
    icon: MoreHorizontal,
    gradient: 'from-slate-500 to-slate-600',
    bg: 'bg-slate-500/12 border-slate-500/30',
    active: 'bg-gradient-to-br from-slate-500 to-slate-600 border-transparent',
  },
] as const;

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  type: z.enum(['ACTIVITY', 'RESTAURANT', 'HOTEL', 'TRANSPORT', 'OTHER']),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  startTime: z.string().optional(),
  durationMins: z.string().optional(),
  cost: z.string().optional(),
  currency: z.string().length(3).optional().default('BRL'),
});

type FormValues = z.input<typeof schema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface ItineraryItemFormProps {
  tripId: string;
  dayId: string;
  dayLabel: string;
  /** If provided, we are in edit mode */
  item?: ItineraryItem;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ItineraryItemForm({
  tripId,
  dayId,
  dayLabel,
  item,
  onClose,
}: ItineraryItemFormProps) {
  const queryClient = useQueryClient();
  const isEdit = !!item;
  const [locale] = useLocale();

  const PLACEHOLDER_MAP: Record<string, string> = {
    RESTAURANT: t(locale, 'item_placeholder.restaurant'),
    HOTEL: t(locale, 'item_placeholder.hotel'),
    TRANSPORT: t(locale, 'item_placeholder.transport'),
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: (item?.type as FormValues['type']) ?? 'ACTIVITY',
      title: item?.title ?? '',
      description: item?.description ?? '',
      location: item?.location ?? '',
      startTime: item?.startTime ?? '',
      durationMins: item?.durationMins ? String(item.durationMins) : '',
      cost: item?.cost ? String(Number(item.cost)) : '',
      currency: 'BRL',
    },
  });

  const selectedType = watch('type');
  const selectedCurrency = watch('currency') ?? 'BRL';

  async function onSubmit(values: FormValues) {
    const durationMins = values.durationMins ? parseInt(values.durationMins, 10) : undefined;
    const cost = values.cost ? parseFloat(values.cost) : undefined;
    const startTime = values.startTime && /^\d{2}:\d{2}$/.test(values.startTime) ? values.startTime : undefined;

    const payload: Record<string, unknown> = {
      type: values.type,
      title: values.title,
      description: values.description || undefined,
      location: values.location || undefined,
      startTime,
      durationMins: durationMins && durationMins > 0 ? durationMins : undefined,
      cost: cost != null && cost >= 0 ? cost : undefined,
    };

    let res: Response;
    if (isEdit) {
      res = await fetch(`/api/itinerary-items/${item!.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch(`/api/trips/${tripId}/itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, dayId, order: 0 }),
      });
    }

    const json = await res.json();
    if (!json.success) throw new Error(json.error ?? t(locale, 'item_form.error'));

    queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
    toast.success(isEdit ? t(locale, 'item_form.updated') : t(locale, 'item_form.added'), {
      description: values.title,
    });
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
        initial={{ opacity: 0, y: 48, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 48, scale: 0.96 }}
        transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
        className="w-full sm:max-w-lg bg-card border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground text-sm">
                {isEdit ? t(locale, 'item_form.edit') : t(locale, 'item_form.new')}
              </p>
              <p className="text-xs text-muted-foreground">{dayLabel}</p>
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

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          <form id="item-form" onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">

            {/* Type picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t(locale, 'item_form.type')}
              </label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <div className="grid grid-cols-5 gap-2">
                    {ITEM_TYPES.map((tp) => {
                      const Icon = tp.icon;
                      const active = field.value === tp.value;
                      return (
                        <motion.button
                          key={tp.value}
                          type="button"
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.93 }}
                          onClick={() => field.onChange(tp.value)}
                          className={cn(
                            'relative flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl border transition-all duration-200',
                            active ? tp.active + ' text-white' : tp.bg + ' text-muted-foreground hover:text-foreground'
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[9px] font-semibold leading-tight text-center">
                            {t(locale, tp.labelKey)}
                          </span>
                          {active && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white shadow flex items-center justify-center"
                            >
                              <Check className="w-2.5 h-2.5 text-emerald-600" />
                            </motion.span>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              />
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                {t(locale, 'item_form.title')} <span className="text-destructive">*</span>
              </label>
              <Input
                {...register('title')}
                placeholder={PLACEHOLDER_MAP[selectedType] || t(locale, 'item_placeholder.default')}
                className="h-10"
              />
              {errors.title && (
                <p className="text-xs text-destructive">{t(locale, 'item_form.title_required')}</p>
              )}
            </div>

            {/* Time + Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" /> {t(locale, 'item_form.time')}
                </label>
                <Input
                  {...register('startTime')}
                  type="time"
                  className="h-10"
                  placeholder="09:00"
                />
                {errors.startTime && (
                  <p className="text-xs text-destructive">{errors.startTime.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" /> {t(locale, 'item_form.duration')}
                </label>
                <Input
                  {...register('durationMins')}
                  type="number"
                  min="0"
                  placeholder="120"
                  className="h-10"
                />
                {errors.durationMins && (
                  <p className="text-xs text-destructive">{errors.durationMins.message}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {t(locale, 'item_form.location')}
              </label>
              <Input
                {...register('location')}
                placeholder={t(locale, 'item_form.location_placeholder')}
                className="h-10"
              />
            </div>

            {/* Cost + Currency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-muted-foreground" /> {t(locale, 'item_form.cost')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">
                    {getCurrencySymbolByCode(selectedCurrency)}
                  </span>
                  <Input
                    {...register('cost')}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    className="pl-9 h-10"
                  />
                </div>
                {errors.cost && (
                  <p className="text-xs text-destructive">{errors.cost.message}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">{t(locale, 'expense.currency')}</label>
                <select
                  {...register('currency')}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.code} {c.symbol}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                {t(locale, 'item_form.notes')}{' '}
                <span className="text-muted-foreground font-normal text-xs">({t(locale, 'common.optional')})</span>
              </label>
              <textarea
                {...register('description')}
                rows={2}
                placeholder={t(locale, 'item_form.notes_placeholder')}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all resize-none"
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border bg-muted/30 shrink-0">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11"
            >
              {t(locale, 'common.cancel')}
            </Button>
            <Button
              type="submit"
              form="item-form"
              disabled={isSubmitting}
              className="flex-1 h-11 font-semibold gap-2"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {t(locale, 'common.saving')}</>
              ) : (
                <><Check className="w-4 h-4" /> {isEdit ? t(locale, 'item_form.save') : t(locale, 'common.add')}</>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
