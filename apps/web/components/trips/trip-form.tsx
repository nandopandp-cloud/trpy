'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

function makeResolver(s: typeof schema) {
  return async (values: TripFormValues) => {
    const result = s.safeParse(values);
    if (result.success) return { values: result.data, errors: {} };
    const errors: Record<string, { message: string; type: string }> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      if (!errors[path]) errors[path] = { message: issue.message, type: issue.code };
    }
    return { values: {}, errors };
  };
}

export function TripForm({ defaultValues, onSubmit, submitLabel = 'Salvar' }: TripFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TripFormValues>({
    resolver: makeResolver(schema) as any,
    defaultValues: {
      currency: 'BRL',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-5">
      <Field label="Título da viagem" error={errors.title?.message}>
        <Input placeholder="Ex: Férias em Lisboa" {...register('title')} />
      </Field>

      <Field label="Destino" error={errors.destination?.message}>
        <Input placeholder="Ex: Lisboa, Portugal" {...register('destination')} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Data de início" error={errors.startDate?.message}>
          <Input type="date" {...register('startDate')} />
        </Field>
        <Field label="Data de fim" error={errors.endDate?.message}>
          <Input type="date" {...register('endDate')} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Orçamento" error={errors.budget?.message}>
          <Input type="number" step="0.01" min="0" placeholder="5000" {...register('budget')} />
        </Field>
        <Field label="Moeda" error={errors.currency?.message}>
          <select
            {...register('currency')}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="BRL">BRL — Real</option>
            <option value="USD">USD — Dólar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — Libra</option>
          </select>
        </Field>
      </div>

      <Field label="Descrição (opcional)" error={errors.description?.message}>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="Conte um pouco sobre essa viagem..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </Field>

      <Button type="submit" disabled={isSubmitting} className="w-full gap-2 bg-ocean hover:opacity-90 border-0 glow-teal h-11 text-base font-semibold">
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {isSubmitting ? 'Salvando...' : submitLabel}
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
