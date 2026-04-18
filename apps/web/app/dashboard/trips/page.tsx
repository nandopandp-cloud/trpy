'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, X, LayoutGrid, List, Calendar, ChevronRight } from 'lucide-react';
import type { TripStatus } from '@trpy/database';
import { useTrips, useDeleteTrip } from '@/hooks/useTrips';
import { TripCard } from '@/components/trips/trip-card';
import { HeroCard } from '@/components/cards/hero-card';
import { SearchBarPremium } from '@/components/forms/search-bar-premium';
import { Button } from '@/components/ui/button';
import { CardSkeleton } from '@/components/ui/skeletons';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useLocale, t, type Locale } from '@/lib/i18n';
import { useConfirm } from '@/components/ui/confirm-dialog';

const GRADIENT_FALLBACKS = [
  'from-indigo-600 via-violet-600 to-purple-700',
  'from-sky-600 via-blue-600 to-indigo-700',
  'from-emerald-600 via-teal-600 to-cyan-700',
  'from-amber-600 via-orange-500 to-red-600',
  'from-rose-600 via-pink-600 to-fuchsia-700',
];

export default function TripsPage() {
  const router = useRouter();
  const [locale] = useLocale();
  const confirm = useConfirm();
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const STATUS_FILTERS = [
    { label: t(locale, 'trips.filter.all'), value: 'ALL' },
    { label: t(locale, 'trips.filter.planning'), value: 'PLANNING' },
    { label: t(locale, 'trips.filter.ongoing'), value: 'ONGOING' },
    { label: t(locale, 'trips.filter.completed'), value: 'COMPLETED' },
  ];

  const STATUS_LABEL: Record<string, string> = {
    PLANNING: t(locale, 'status.planning'),
    ONGOING: t(locale, 'status.ongoing'),
    COMPLETED: t(locale, 'status.completed'),
    CANCELLED: t(locale, 'status.cancelled'),
  };

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
          tr =>
            tr.title.toLowerCase().includes(search.toLowerCase()) ||
            tr.destination.toLowerCase().includes(search.toLowerCase())
        ),
    [allTrips, search]
  );

  const suggestions = useMemo(() =>
    allTrips
      .filter(tr =>
        search.length > 0 &&
        (tr.destination.toLowerCase().includes(search.toLowerCase()) ||
         tr.title.toLowerCase().includes(search.toLowerCase()))
      )
      .slice(0, 4)
      .map(tr => ({ label: tr.destination, sub: tr.title })),
    [allTrips, search]
  );

  const featuredTrip = allTrips.find(tr => tr.status === 'ONGOING') ?? allTrips[0];
  const restTrips = trips.filter(tr => tr.id !== featuredTrip?.id || search !== '' || activeFilter !== 'ALL');

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">

      {/* ── Header ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between"
      >
        <div>
          <h1 className="text-2xl font-medium text-foreground tracking-tight">{t(locale, 'trips.title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {(data?.total ?? 0) !== 1
              ? t(locale, 'trips.count_plural').replace('{count}', String(data?.total ?? 0))
              : t(locale, 'trips.count').replace('{count}', String(data?.total ?? 0))}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-muted rounded-full p-1 border border-border">
            <button
              onClick={() => setViewMode('grid')}
              className={cn('w-7 h-7 rounded-full flex items-center justify-center transition-all', viewMode === 'grid' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn('w-7 h-7 rounded-full flex items-center justify-center transition-all', viewMode === 'list' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => router.push('/dashboard/trips/new')}
            className="flex items-center gap-2 bg-foreground text-background font-medium text-sm px-5 py-2.5 rounded-full hover:opacity-90 transition-all shadow-sm group relative overflow-hidden"
          >
            <Plus className="w-4 h-4" />
            {t(locale, 'trips.new')}
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute top-0 left-0 h-full w-full -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-[shimmer_1.5s_infinite] group-hover:opacity-100" />
            </span>
          </motion.button>
        </div>
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
          placeholder={t(locale, 'trips.search')}
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
          {t(locale, 'trips.error')}
        </div>
      ) : trips.length === 0 ? (
        <EmptyState search={search} onNew={() => router.push('/dashboard/trips/new')} locale={locale} />
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
                <p className="text-sm font-medium text-foreground mb-4">{t(locale, 'trips.other')}</p>
              )}

              {viewMode === 'grid' ? (
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
                        onDelete={async () => {
                          const ok = await confirm({
                            title: 'Excluir viagem?',
                            description: 'Todo o itinerário, despesas e dados serão removidos permanentemente.',
                            detail: trip.title,
                            confirmLabel: 'Excluir viagem',
                            variant: 'danger',
                          });
                          if (ok) deleteTrip.mutate(trip.id);
                        }}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-card">
                  <div className="divide-y divide-border">
                    <AnimatePresence mode="popLayout">
                      {restTrips.map((trip, i) => {
                        const now = new Date();
                        const start = new Date(trip.startDate);
                        const end = new Date(trip.endDate);
                        const effectiveStatus = trip.status === 'CANCELLED' ? 'CANCELLED'
                          : now > end ? 'COMPLETED'
                          : now >= start && now <= end ? 'ONGOING'
                          : 'PLANNING';
                        const isActive = effectiveStatus === 'ONGOING';
                        const fallback = GRADIENT_FALLBACKS[i % GRADIENT_FALLBACKS.length];
                        return (
                          <motion.div
                            key={trip.id}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 12 }}
                            transition={{ delay: i * 0.04, duration: 0.25 }}
                            className="flex items-center gap-5 p-4 hover:bg-muted/30 transition-colors cursor-pointer group"
                            onClick={() => router.push(`/dashboard/trips/${trip.id}`)}
                          >
                            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0">
                              {trip.coverImage ? (
                                <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                              ) : (
                                <div className={cn('w-full h-full bg-gradient-to-br', fallback)} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-foreground tracking-tight truncate">{trip.title}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                <Calendar className="w-3 h-3 shrink-0" />
                                {format(new Date(trip.startDate), "d MMM", { locale: ptBR })} — {format(new Date(trip.endDate), "d MMM yyyy", { locale: ptBR })}
                              </p>
                            </div>
                            <span className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shrink-0',
                              effectiveStatus === 'ONGOING' ? 'bg-emerald-500/10 text-emerald-500' :
                              effectiveStatus === 'PLANNING' ? 'bg-amber-500/10 text-amber-500' :
                              effectiveStatus === 'CANCELLED' ? 'bg-red-500/10 text-red-500' :
                              'bg-muted text-muted-foreground'
                            )}>
                              {effectiveStatus === 'ONGOING' && (
                                <span className="relative flex h-1.5 w-1.5 shrink-0">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                                </span>
                              )}
                              {STATUS_LABEL[effectiveStatus]}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/trips/${trip.id}/edit`); }}
                                className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted"
                              >
                                {t(locale, 'common.edit')}
                              </button>
                              <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              )}
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
            {t(locale, 'trips.deleting')}
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

function EmptyState({ search, onNew, locale }: { search: string; onNew: () => void; locale: Locale }) {
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
        {search ? t(locale, 'trips.empty.search') : t(locale, 'trips.empty.title')}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs">
        {search
          ? t(locale, 'trips.empty.search_desc').replace('{search}', search)
          : t(locale, 'trips.empty.desc')}
      </p>
      {!search && (
        <button
          onClick={onNew}
          className="inline-flex items-center gap-2 bg-foreground text-background text-sm font-medium px-6 py-3 rounded-full hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" /> {t(locale, 'trips.create')}
        </button>
      )}
    </motion.div>
  );
}
