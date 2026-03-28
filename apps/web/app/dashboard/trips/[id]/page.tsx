'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft, Edit2, MapPin, Calendar, Wallet,
  Plus, Trash2, Loader2, Share2, MoreVertical,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useTrip } from '@/hooks/useTrip';
import { useDeleteTrip } from '@/hooks/useTrips';
import { ItineraryDay } from '@/components/itinerary/itinerary-day';
import { BudgetDashboard } from '@/components/budget/budget-dashboard';
import { ExpenseForm } from '@/components/budget/expense-form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DashboardSkeleton } from '@/components/ui/skeletons';
import { cn } from '@/lib/utils';
import type { ItineraryItem } from '@trpy/database';

const STATUS_STYLE: Record<string, string> = {
  PLANNING: 'bg-sky-500/25 text-sky-300 border-sky-500/40',
  ONGOING: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40',
  COMPLETED: 'bg-slate-500/25 text-slate-300 border-slate-500/40',
  CANCELLED: 'bg-red-500/25 text-red-300 border-red-500/40',
};
const STATUS_LABEL: Record<string, string> = {
  PLANNING: 'Planejando', ONGOING: 'Em andamento',
  COMPLETED: 'Concluída', CANCELLED: 'Cancelada',
};

const GRADIENTS = [
  'from-emerald-700 via-teal-700 to-cyan-800',
  'from-violet-700 via-purple-700 to-indigo-800',
  'from-rose-700 via-pink-700 to-fuchsia-800',
  'from-amber-700 via-orange-600 to-red-700',
  'from-blue-700 via-indigo-700 to-violet-800',
];

export default function TripDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const { data: trip, isLoading, isError } = useTrip(params.id);
  const deleteTrip = useDeleteTrip();

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/itinerary-items/${itemId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', params.id] }),
    onError: () => toast.error('Erro ao excluir atividade'),
  });

  async function handleDeleteTrip() {
    setShowActions(false);
    if (!confirm(`Excluir "${trip?.title}"?`)) return;
    await deleteTrip.mutateAsync(params.id);
    toast.success('Viagem excluída');
    router.push('/dashboard/trips');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="text-5xl">🗺️</div>
          <p className="text-muted-foreground font-medium">Viagem não encontrada.</p>
          <Button variant="outline" onClick={() => router.push('/dashboard/trips')}>
            Voltar para viagens
          </Button>
        </div>
      </div>
    );
  }

  const budget = Number(trip.budget);
  const spent = Number(trip.totalSpent);
  const progress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const gradientFallback = GRADIENTS[trip.id.charCodeAt(0) % GRADIENTS.length];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative h-72 md:h-96 overflow-hidden">
        {trip.coverImage ? (
          <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
        ) : (
          <div className={cn('w-full h-full bg-gradient-to-br', gradientFallback)} />
        )}

        {/* Hero overlay */}
        <div className="absolute inset-0 hero-overlay" />

        {/* Top nav */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 md:p-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl glass-dark flex items-center justify-center text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.button>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push(`/dashboard/trips/${params.id}/edit`)}
              className="w-10 h-10 rounded-2xl glass-dark flex items-center justify-center text-white"
            >
              <Edit2 className="w-4 h-4" />
            </motion.button>

            {/* Actions menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowActions(!showActions)}
                className="w-10 h-10 rounded-2xl glass-dark flex items-center justify-center text-white"
              >
                <MoreVertical className="w-4 h-4" />
              </motion.button>
              <AnimatePresence>
                {showActions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-48 rounded-2xl bg-card border border-border shadow-card-lg overflow-hidden z-50"
                  >
                    <button
                      onClick={() => { setShowActions(false); toast.info('Compartilhamento em breve'); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors"
                    >
                      <Share2 className="w-4 h-4 text-muted-foreground" />
                      Compartilhar
                    </button>
                    <button
                      onClick={handleDeleteTrip}
                      disabled={deleteTrip.isPending}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      {deleteTrip.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Excluir viagem
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Trip info at bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className={cn(
                'inline-block text-xs font-semibold px-2.5 py-1 rounded-full border mb-2',
                STATUS_STYLE[trip.status]
              )}>
                {STATUS_LABEL[trip.status]}
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">{trip.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="flex items-center gap-1.5 text-white/75 text-sm">
                  <MapPin className="w-3.5 h-3.5 shrink-0" /> {trip.destination}
                </span>
                <span className="flex items-center gap-1.5 text-white/75 text-sm">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  {format(new Date(trip.startDate), "d MMM", { locale: ptBR })}
                  {' — '}
                  {format(new Date(trip.endDate), "d MMM yyyy", { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 md:px-6 -mt-4">
        {/* Budget card floating above content */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card border border-border rounded-3xl px-5 py-4 shadow-card-lg mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Wallet className="w-4 h-4 text-primary" /> Orçamento
            </div>
            <span className="text-sm font-bold text-foreground">
              {trip.currency} {spent.toLocaleString('pt-BR')}
              <span className="text-muted-foreground font-normal text-xs"> / {budget.toLocaleString('pt-BR')}</span>
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={cn(
                'h-full rounded-full bg-gradient-to-r',
                progress >= 90 ? 'from-red-500 to-orange-400' :
                progress >= 70 ? 'from-amber-500 to-yellow-400' :
                'from-emerald-500 to-teal-400'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">{progress.toFixed(0)}% utilizado</span>
            <span className="text-xs text-muted-foreground">
              {trip.currency} {(budget - spent).toLocaleString('pt-BR')} restante
            </span>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="itinerary">
          <TabsList className="mb-6 w-full">
            <TabsTrigger value="itinerary" className="flex-1">
              Itinerário
              {trip.itineraryDays.length > 0 && (
                <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                  {trip.itineraryDays.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex-1">
              Despesas
              {trip.expenses.length > 0 && (
                <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                  {trip.expenses.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Itinerary tab */}
          <TabsContent value="itinerary">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              {trip.itineraryDays.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border p-10 text-center">
                  <div className="text-4xl mb-3">🗓️</div>
                  <p className="text-sm font-medium text-foreground mb-1">Itinerário vazio</p>
                  <p className="text-xs text-muted-foreground">
                    Use <code className="bg-muted px-1.5 py-0.5 rounded text-xs">POST /api/trips/{params.id}/itinerary</code> para adicionar dias.
                  </p>
                </div>
              ) : (
                trip.itineraryDays.map((day) => (
                  <ItineraryDay
                    key={day.id}
                    day={day}
                    onAddItem={(dayId) => toast.info(`Adicionar item ao dia ${dayId} (em breve)`)}
                    onEditItem={(item: ItineraryItem) => toast.info(`Editar ${item.title} (em breve)`)}
                    onDeleteItem={(itemId) => {
                      if (confirm('Excluir atividade?')) deleteItemMutation.mutate(itemId);
                    }}
                  />
                ))
              )}
            </motion.div>
          </TabsContent>

          {/* Budget tab */}
          <TabsContent value="budget">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <BudgetDashboard trip={trip} expenses={trip.expenses} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Floating bottom CTA ──────────────────────────────────── */}
      <div className="fixed bottom-16 md:bottom-6 left-0 right-0 flex justify-center px-4 z-30 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="pointer-events-auto"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowExpenseForm(true)}
            className="flex items-center gap-2.5 bg-ocean text-white font-bold px-6 py-3.5 rounded-full shadow-teal-lg glow-teal"
          >
            <Plus className="w-5 h-5" />
            Adicionar despesa
          </motion.button>
        </motion.div>
      </div>

      {/* Expense form modal */}
      <AnimatePresence>
        {showExpenseForm && (
          <ExpenseForm
            tripId={params.id}
            onClose={() => setShowExpenseForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
