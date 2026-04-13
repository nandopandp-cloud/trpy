'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale, t } from '@/lib/i18n';

const schema = z
  .object({
    title: z.string().min(1, 'Título obrigatório').max(100),
    destination: z.string().min(1, 'Destino obrigatório').max(200),
    startDate: z.string().min(1, 'Data de início obrigatória'),
    endDate: z.string().min(1, 'Data de fim obrigatória'),
    budget: z.coerce.number().positive('Deve ser maior que 0'),
    currency: z.string().length(3).default('BRL'),
    description: z.string().max(1000).optional(),
  })
  .refine((d) => new Date(d.endDate) > new Date(d.startDate), {
    message: 'Data de fim deve ser após a data de início',
    path: ['endDate'],
  });

export type TripFormValues = z.infer<typeof schema>;

interface TripFormProps {
  defaultValues?: Partial<TripFormValues>;
  onSubmit: (values: TripFormValues) => Promise<void>;
  submitLabel?: string;
}

export function TripForm({ defaultValues, onSubmit, submitLabel }: TripFormProps) {
  const [locale] = useLocale();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<TripFormValues>({
    defaultValues: {
      currency: 'BRL',
      ...defaultValues,
    },
  });

  async function handleValidSubmit(values: TripFormValues) {
    const result = schema.safeParse(values);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof TripFormValues;
        if (field) setError(field, { message: issue.message });
      }
      return;
    }
    await onSubmit(result.data);
  }

  return (
    <form onSubmit={handleSubmit(handleValidSubmit)} className="space-y-5">
      <Field label={t(locale, 'form.trip.title')} error={errors.title?.message}>
        <Input placeholder={t(locale, 'form.trip.title_placeholder')} {...register('title')} />
      </Field>

      <Field label={t(locale, 'form.trip.destination')} error={errors.destination?.message}>
        <Input placeholder={t(locale, 'form.trip.destination_placeholder')} {...register('destination')} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t(locale, 'form.trip.start_date')} error={errors.startDate?.message}>
          <Input type="date" {...register('startDate')} />
        </Field>
        <Field label={t(locale, 'form.trip.end_date')} error={errors.endDate?.message}>
          <Input type="date" {...register('endDate')} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t(locale, 'form.trip.budget')} error={errors.budget?.message}>
          <Input type="number" step="0.01" min="0" placeholder="5000" {...register('budget')} />
        </Field>
        <Field label={t(locale, 'form.trip.currency')} error={errors.currency?.message}>
          <select
            {...register('currency')}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="BRL">{t(locale, 'form.trip.currency_brl')}</option>
            <option value="USD">{t(locale, 'form.trip.currency_usd')}</option>
            <option value="EUR">{t(locale, 'form.trip.currency_eur')}</option>
            <option value="GBP">{t(locale, 'form.trip.currency_gbp')}</option>
          </select>
        </Field>
      </div>

      <Field label={t(locale, 'form.trip.description')} error={errors.description?.message}>
        <textarea
          {...register('description')}
          rows={3}
          placeholder={t(locale, 'form.trip.description_placeholder')}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </Field>

      <Button type="submit" disabled={isSubmitting} className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 border-0 shadow-md shadow-primary/20 h-11 text-base font-semibold">
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {isSubmitting ? t(locale, 'common.saving') : (submitLabel || t(locale, 'common.save'))}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
