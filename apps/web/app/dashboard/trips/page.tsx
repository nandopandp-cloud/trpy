'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Plane, Loader2 } from 'lucide-react';
import type { TripStatus } from '@trpy/database';
import { useTrips, useDeleteTrip } from '@/hooks/useTrips';
import { TripCard } from '@/components/trips/trip-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardSkeleton } from '@/components/ui/skeletons';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TABS: { label: string; value: string }[] = [
  { label: 'Todas', value: 'ALL' },
  { label: 'Planejando', value: 'PLANNING' },
  { label: 'Em andamento', value: 'ONGOING' },
  { label: 'Concluídas', value: 'COMPLETED' },
];

export default function TripsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useTrips({
    status: activeTab !== 'ALL' ? (activeTab as TripStatus) : undefined,
  });

  const deleteTrip = useDeleteTrip();

  const trips = (data?.trips ?? []).filter((t) =>
    search === '' ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Minhas Viagens</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {data?.total ?? 0} viagem{data?.total !== 1 ? 's' : ''} no total
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/trips/new')} className="gap-2 bg-ocean hover:opacity-90 border-0 glow-teal">
            <Plus className="w-4 h-4" />
            Nova viagem
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="h-9">
              {TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="text-xs px-3">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por destino ou título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-16 text-muted-foreground">
            Erro ao carregar viagens. Tente novamente.
          </div>
        ) : trips.length === 0 ? (
          <EmptyState search={search} onNew={() => router.push('/dashboard/trips/new')} />
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              initial={false}
            >
              {trips.map((trip, i) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  index={i}
                  onClick={() => router.push(`/dashboard/trips/${trip.id}`)}
                  onEdit={() => router.push(`/dashboard/trips/${trip.id}/edit`)}
                  onDelete={() => {
                    if (confirm(`Excluir "${trip.title}"?`)) {
                      deleteTrip.mutate(trip.id);
                    }
                  }}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {deleteTrip.isPending && (
          <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2 text-sm shadow-lg">
            <Loader2 className="w-4 h-4 animate-spin" />
            Excluindo...
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ search, onNew }: { search: string; onNew: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <Plane className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {search ? 'Nenhuma viagem encontrada' : 'Nenhuma viagem ainda'}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        {search
          ? `Nenhum resultado para "${search}".`
          : 'Crie sua primeira viagem e comece a planejar sua aventura.'}
      </p>
      {!search && (
        <Button onClick={onNew} className="gap-2 bg-ocean hover:opacity-90 border-0 glow-teal">
          <Plus className="w-4 h-4" />
          Criar viagem
        </Button>
      )}
    </motion.div>
  );
}
