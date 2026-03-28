'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft, Edit2, MapPin, Calendar, Wallet,
  Plus, Trash2, Loader2,
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

const STATUS_COLOR: Record<string, string> = {
  PLANNING: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ONGOING: 'bg-green-500/20 text-green-400 border-green-500/30',
  COMPLETED: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};
const STATUS_LABEL: Record<string, string> = {
  PLANNING: 'Planejando', ONGOING: 'Em andamento',
  COMPLETED: 'Concluída', CANCELLED: 'Cancelada',
};

export default function TripDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showExpenseForm, setShowExpenseForm] = useState(false);
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
    if (!confirm(`Excluir "${trip?.title}"?`)) return;
    await deleteTrip.mutateAsync(params.id);
    toast.success('Viagem excluída');
    router.push('/dashboard/trips');
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-muted-foreground">Viagem não encontrada.</p>
          <Button variant="outline" onClick={() => router.push('/dashboard/trips')}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const budget = Number(trip.budget);
  const spent = Number(trip.totalSpent);

  return (
    <div className="min-h-screen bg-background">
      {/* Cover hero */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        {trip.coverImage ? (
          <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-violet-600 to-purple-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Nav */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            className="bg-black/30 hover:bg-black/50 text-white border-0"
            onClick={() => router.push('/dashboard/trips')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/30 hover:bg-black/50 text-white border-0"
              onClick={() => router.push(`/dashboard/trips/${params.id}/edit`)}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/30 hover:bg-red-500/70 text-white border-0"
              onClick={handleDeleteTrip}
              disabled={deleteTrip.isPending}
            >
              {deleteTrip.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Trip info */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">{trip.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-white/80 text-xs">
                  <MapPin className="w-3 h-3" /> {trip.destination}
                </span>
                <span className="flex items-center gap-1 text-white/80 text-xs">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(trip.startDate), "d MMM", { locale: ptBR })}
                  {' — '}
                  {format(new Date(trip.endDate), "d MMM yyyy", { locale: ptBR })}
                </span>
              </div>
            </div>
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full border shrink-0', STATUS_COLOR[trip.status])}>
              {STATUS_LABEL[trip.status]}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Budget bar */}
        <div className="flex items-center gap-4 py-3 px-4 rounded-xl border border-border bg-card mb-6">
          <Wallet className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn(
                  'h-full rounded-full bg-gradient-to-r',
                  spent / budget >= 0.9 ? 'from-red-500 to-orange-500' :
                  spent / budget >= 0.7 ? 'from-amber-500 to-yellow-500' :
                  'from-blue-500 to-violet-500'
                )}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((spent / budget) * 100, 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
          <span className="text-xs text-foreground font-medium shrink-0">
            {trip.currency} {spent.toLocaleString('pt-BR')}
            <span className="text-muted-foreground font-normal"> / {budget.toLocaleString('pt-BR')}</span>
          </span>
        </div>

        <Tabs defaultValue="itinerary">
          <TabsList className="mb-6">
            <TabsTrigger value="itinerary">
              Itinerário
              {trip.itineraryDays.length > 0 && (
                <span className="ml-1.5 text-xs bg-muted px-1.5 py-0.5 rounded-full">
                  {trip.itineraryDays.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="budget">
              Orçamento
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
                <div className="rounded-xl border border-dashed border-border p-10 text-center">
                  <p className="text-sm text-muted-foreground mb-3">Itinerário vazio.</p>
                  <p className="text-xs text-muted-foreground">
                    Use a API <code className="bg-muted px-1 rounded">POST /api/trips/{params.id}/itinerary</code> para adicionar dias.
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
              <div className="flex justify-end">
                <Button onClick={() => setShowExpenseForm(true)} className="gap-2" size="sm">
                  <Plus className="w-3.5 h-3.5" /> Adicionar despesa
                </Button>
              </div>
              <BudgetDashboard trip={trip} expenses={trip.expenses} />
            </motion.div>
          </TabsContent>
        </Tabs>
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
