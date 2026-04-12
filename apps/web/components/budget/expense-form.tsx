'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
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

const CATEGORIES = [
  { value: 'ACCOMMODATION', label: 'Hospedagem', icon: Home,         color: 'from-blue-500 to-blue-600',    bg: 'bg-blue-500/15 border-blue-500/30',    active: 'bg-blue-500 border-blue-500' },
  { value: 'FOOD',          label: 'Alimentação', icon: Utensils,    color: 'from-amber-500 to-orange-500', bg: 'bg-amber-500/15 border-amber-500/30',  active: 'bg-amber-500 border-amber-500' },
  { value: 'TRANSPORT',     label: 'Transporte',  icon: Bus,         color: 'from-violet-500 to-purple-600',bg: 'bg-violet-500/15 border-violet-500/30',active: 'bg-violet-500 border-violet-500' },
  { value: 'ACTIVITIES',    label: 'Atividades',  icon: Zap,         color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/15 border-emerald-500/30', active: 'bg-emerald-500 border-emerald-500' },
  { value: 'SHOPPING',      label: 'Compras',     icon: ShoppingBag, color: 'from-rose-500 to-pink-500',    bg: 'bg-rose-500/15 border-rose-500/30',    active: 'bg-rose-500 border-rose-500' },
  { value: 'HEALTH',        label: 'Saúde',       icon: Heart,       color: 'from-red-500 to-rose-600',     bg: 'bg-red-500/15 border-red-500/30',      active: 'bg-red-500 border-red-500' },
  { value: 'OTHER',         label: 'Outros',      icon: MoreHorizontal, color: 'from-slate-500 to-slate-600', bg: 'bg-slate-500/15 border-slate-500/30', active: 'bg-slate-500 border-slate-500' },
] as const;

const schema = z.object({
  title: z.string().min(1, 'Título obrigatório').max(200),
  amount: z.coerce.number().positive('Valor deve ser maior que 0'),
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

export function ExpenseForm({ tripId, onClose, onSuccess }: ExpenseFormProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('OTHER');
  const queryClient = useQueryClient();

  // Lock body scroll while modal is open (prevents jank on mobile)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const { register, handleSubmit, setValue, setError, formState: { errors, isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      category: 'OTHER',
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  async function onSubmit(values: FormValues) {
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
    toast.success('Despesa adicionada!', { description: `${validated.title} — R$ ${validated.amount}` });
    onSuccess?.();
    onClose();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.95 }}
        transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
        className="w-full max-w-md bg-card border border-border rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h3 className="font-bold text-lg">Nova despesa</h3>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </motion.button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Category picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Categoria</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const active = selectedCategory === cat.value;
                return (
                  <motion.button
                    key={cat.value}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => {
                      setSelectedCategory(cat.value);
                      setValue('category', cat.value as any);
                    }}
                    className={cn(
                      'relative flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all duration-200',
                      active ? cn(cat.active, 'text-white') : cn(cat.bg, 'text-muted-foreground hover:text-foreground')
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="cat-active"
                        className="absolute inset-0 rounded-xl"
                        style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.3 }}
                      />
                    )}
                    <Icon className={cn('w-4 h-4 relative z-10', active && 'text-white')} />
                    <span className={cn('text-[9px] font-medium leading-tight text-center relative z-10', active && 'text-white')}>
                      {cat.label}
                    </span>
                    {active && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center z-20 shadow"
                      >
                        <Check className="w-2.5 h-2.5 text-green-600" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Descrição</label>
            <Input placeholder="Ex: Jantar no restaurante" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          {/* Amount + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Valor (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
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
              <label className="text-sm font-medium">Data</label>
              <Input type="date" {...register('date')} />
              {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Notas <span className="text-muted-foreground font-normal">(opcional)</span>
            </label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="Alguma observação..."
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Submit */}
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full gap-2 h-11 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 border-0 shadow-md shadow-primary/20"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
              ) : (
                <><Check className="w-4 h-4" /> Adicionar despesa</>
              )}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </motion.div>
  );
}
