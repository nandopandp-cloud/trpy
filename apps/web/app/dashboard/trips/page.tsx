'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, X } from 'lucide-react';
import type { TripStatus } from '@trpy/database';
import { useTrips, useDeleteTrip } from '@/hooks/useTrips';
import { TripCard } from '@/components/trips/trip-card';
import { HeroCard } from '@/components/cards/hero-card';
import { SearchBarPremium } from '@/components/forms/search-bar-premium';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/ui/skeletons';
import { cn } from '@/lib/utils';

const STATUS_FILTERS = [
  { label: 'Todas', value: 'ALL' },
  { label: 'Planejando', value: 'PLANNING' },
  { label: 'Em andamento', value: 'ONGOING' },
  { label: 'Concluídas', value: 'COMPLETED' },
];

export default function TripsPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useTrips({
    status: activeFilter !== 'ALL' ? (activeFilter as TripStatus) : undefined,
    limit: 20,
  });
  const deleteTrip = useDeleteTrip();

  const allTrips = data?.trips ?? [];

  const trips = useMemo(() =>
    search === ''
      ? allTrips
      : allTrips.filter(
          t =>
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.destination.toLowerCase().includes(search.toLowerCase())
        ),
    [allTrips, search]
  );

  const suggestions = useMemo(() =>
    allTrips
      .filter(t =>
        search.length > 0 &&
        (t.destination.toLowerCase().includes(search.toLowerCase()) ||
         t.title.toLowerCase().includes(search.toLowerCase()))
      )
      .slice(0, 4)
      .map(t => ({ label: t.destination, sub: t.title })),
    [allTrips, search]
  );

  const featuredTrip = allTrips.find(t => t.status === 'ONGOING') ?? allTrips[0];
  const restTrips = trips.filter(t => t.id !== featuredTrip?.id || search !== '' || activeFilter !== 'ALL');

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">

      {/* ── Header ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between"
      >
        <div>
          <h1 className="text-2xl font-medium text-foreground tracking-tight">Minhas Viagens</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {data?.total ?? 0} viagem{(data?.total ?? 0) !== 1 ? 's' : ''} no total
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => router.push('/dashboard/trips/new')}
          className="hidden sm:flex items-center gap-2 bg-foreground text-background font-medium text-sm px-5 py-2.5 rounded-full hover:opacity-90 transition-all shadow-sm group relative overflow-hidden"
        >
          <Plus className="w-4 h-4" />
          Nova viagem
          <span className="absolute inset-0 overflow-hidden rounded-full">
            <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
          </span>
        </motion.button>
      </motion.div>

      {/* ── Search ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <SearchBarPremium
          value={search}
          onChange={setSearch}
          placeholder="Buscar destinos, viagens..."
          suggestions={suggestions}
          onSuggestionSelect={(s) => setSearch(s.label)}
        />
      </motion.div>

      {/* ── Filter pills ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 scroll-x-hidden pb-1 -mx-4 px-4 md:mx-0 md:px-0"
      >
        {STATUS_FILTERS.map((f) => (
          <motion.button
            key={f.value}
            whileTap={{ scale: 0.93 }}
            onClick={() => setActiveFilter(f.value)}
            className={cn(
              'shrink-0 text-xs font-medium px-4 py-2 rounded-full border transition-all duration-200',
              activeFilter === f.value
                ? 'bg-foreground text-background border-transparent shadow-sm'
                : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
            )}
          >
            {f.label}
          </motion.button>
        ))}

        <AnimatePresence>
          {search && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setSearch('')}
              className="shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full bg-primary/10 text-primary border border-primary/25"
            >
              &ldquo;{search}&rdquo; <X className="w-3 h-3" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Content ─────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-6">
          <CardSkeleton className="h-72" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
          </div>
        </div>
      ) : isError ? (
        <div className="text-center py-16 text-muted-foreground">
          Erro ao carregar viagens. Tente novamente.
        </div>
      ) : trips.length === 0 ? (
        <EmptyState search={search} onNew={() => router.push('/dashboard/trips/new')} />
      ) : (
        <div className="space-y-6">
          {featuredTrip && search === '' && activeFilter === 'ALL' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <HeroCard
                trip={featuredTrip}
                onClick={() => router.push(`/dashboard/trips/${featuredTrip.id}`)}
              />
            </motion.div>
          )}

          {restTrips.length > 0 && (
            <div>
              {search === '' && activeFilter === 'ALL' && featuredTrip && (
                <p className="text-sm font-medium text-foreground mb-4">Outras viagens</p>
              )}
              <AnimatePresence mode="popLayout">
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  initial={false}
                >
                  {restTrips.map((trip, i) => (
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
            </div>
          )}
        </div>
      )}

      {/* Delete toast */}
      <AnimatePresence>
        {deleteTrip.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-20 md:bottom-6 right-4 md:right-6 flex items-center gap-2.5 bg-card border border-border rounded-2xl px-4 py-3 text-sm shadow-card-lg z-50"
          >
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            Excluindo viagem...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile FAB */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', bounce: 0.4 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => router.push('/dashboard/trips/new')}
        className="sm:hidden fixed bottom-20 right-4 w-14 h-14 rounded-full bg-foreground text-background flex items-center justify-center shadow-indigo-lg glow-indigo z-30"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
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
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-5 text-3xl"
      >
        {search ? '🔍' : '✈️'}
      </motion.div>
      <h3 className="text-lg font-medium text-foreground mb-1">
        {search ? 'Nenhuma viagem encontrada' : 'Sem viagens ainda'}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        {search
          ? `Nenhum resultado para "${search}".`
          : 'Crie sua primeira aventura e comece a planejar.'}
      </p>
      {!search && (
        <button
          onClick={onNew}
          className="inline-flex items-center gap-2 bg-foreground text-background text-sm font-medium px-6 py-3 rounded-full hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" /> Criar viagem
        </button>
      )}
    </motion.div>
  );
}
