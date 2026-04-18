'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, MapPin, ExternalLink, Utensils, Hotel,
  Landmark, Building2, ChevronRight, ChevronDown,
} from 'lucide-react';
import { FavoriteButton } from '@/components/favorites/favorite-button';
import { PlaceDetailModal } from './place-detail-modal';
import { PlacesFilter, applyFilters, countActiveFilters, DEFAULT_FILTERS, type PlacesFilters } from './places-filter';
import type { PlaceSearchResult } from '@/lib/integrations/google/places-service';
import { useLocale, t, formatNumber, type Locale } from '@/lib/i18n';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RecommendationsData {
  restaurants: PlaceSearchResult[];
  hotels: PlaceSearchResult[];
  attractions: PlaceSearchResult[];
}

const TABS = [
  { key: 'restaurants', labelKey: 'places.restaurants', icon: Utensils, favoriteType: 'RESTAURANT' },
  { key: 'hotels',      labelKey: 'places.hotels',       icon: Hotel,    favoriteType: 'HOTEL' },
  { key: 'attractions', labelKey: 'places.attractions',  icon: Landmark, favoriteType: 'ACTIVITY' },
] as const;

const PRICE = ['', '$', '$$', '$$$', '$$$$'];
const PAGE_SIZE = 10;

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="w-3 h-3"
          fill={i <= Math.round(value) ? 'currentColor' : 'none'}
          strokeWidth={1.5}
          style={{ color: i <= Math.round(value) ? '#F59E0B' : '#6B7280' }}
        />
      ))}
    </div>
  );
}

function PlaceCard({
  place,
  favoriteType,
  locale,
  onOpen,
  index,
}: {
  place: PlaceSearchResult;
  favoriteType: 'RESTAURANT' | 'HOTEL' | 'ACTIVITY';
  locale: Locale;
  onOpen: () => void;
  index: number;
}) {
  const photo = place.photos?.[0];
  const photoUrl = photo
    ? `/api/place-photo?ref=${photo.photo_reference}&maxwidth=600`
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, delay: Math.min(index * 0.04, 0.3) }}
      onClick={onOpen}
      className="flex gap-3 p-3 rounded-2xl bg-muted/50 border border-border hover:border-primary/40 hover:bg-muted/70 transition-all cursor-pointer group"
    >
      {/* Thumbnail */}
      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-muted relative">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={place.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Building2 className="w-6 h-6 opacity-40" />
          </div>
        )}
        {/* Open/Closed badge on thumbnail */}
        {place.opening_hours?.open_now != null && (
          <span className={`absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
            place.opening_hours.open_now
              ? 'bg-emerald-500 text-white'
              : 'bg-red-500/90 text-white'
          }`}>
            {place.opening_hours.open_now ? 'Aberto' : 'Fechado'}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {place.name}
          </p>
          <div onClick={(e) => e.stopPropagation()}>
            <FavoriteButton
              type={favoriteType}
              externalId={place.place_id}
              name={place.name}
              image={photoUrl ?? undefined}
              rating={place.rating}
              metadata={{ googlePlaceId: place.place_id, address: place.formatted_address }}
              size="sm"
              className="shrink-0 -mt-0.5"
            />
          </div>
        </div>

        {/* Rating row */}
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {place.rating != null && (
            <div className="flex items-center gap-1">
              <StarRating value={place.rating} />
              <span className="text-xs text-foreground font-semibold">{place.rating.toFixed(1)}</span>
              {place.user_ratings_total != null && (
                <span className="text-xs text-muted-foreground">
                  ({formatNumber(locale, place.user_ratings_total)})
                </span>
              )}
            </div>
          )}
          {place.price_level != null && place.price_level > 0 && (
            <span className="text-xs font-medium text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">
              {PRICE[place.price_level]}
            </span>
          )}
        </div>

        {place.formatted_address && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />
            {place.formatted_address}
          </p>
        )}

        <span className="inline-flex items-center gap-0.5 text-xs text-primary font-semibold mt-1.5 group-hover:gap-1.5 transition-all">
          {t(locale as any, 'places.details' as any)} <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </motion.div>
  );
}

function EmptyState({
  tab,
  destination,
  locale,
  hasFilters,
  onReset,
}: {
  tab: typeof TABS[number];
  destination: string;
  locale: Locale;
  hasFilters: boolean;
  onReset: () => void;
}) {
  const tabLabel = t(locale as any, tab.labelKey as any);
  const mapsQuery = encodeURIComponent(`${tabLabel} ${destination}`);
  const mapsUrl = `https://www.google.com/maps/search/${mapsQuery}`;
  const Icon = tab.icon;

  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-3">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <div>
        {hasFilters ? (
          <>
            <p className="text-sm font-medium text-foreground">Nenhum lugar com esses filtros</p>
            <p className="text-xs text-muted-foreground mt-1">Tente ajustar os filtros para ver mais resultados.</p>
            <button
              onClick={onReset}
              className="mt-2 text-xs font-semibold text-primary hover:underline"
            >
              Limpar filtros
            </button>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground">{t(locale as any, 'places.empty' as any)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t(locale as any, 'places.no_results_for' as any).replace('{label}', tabLabel.toLowerCase())}
            </p>
          </>
        )}
      </div>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
      >
        {t(locale as any, 'places.search_gmaps' as any)} <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex gap-3 p-3 rounded-2xl bg-muted/50 border border-border animate-pulse">
          <div className="w-20 h-20 rounded-xl bg-muted shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PlacesRecommendations({ destination }: { destination: string }) {
  const [locale] = useLocale();
  const [activeTab, setActiveTab] = useState<'restaurants' | 'hotels' | 'attractions'>('restaurants');
  const [selectedPlace, setSelectedPlace] = useState<{
    placeId: string;
    name: string;
    favoriteType: 'RESTAURANT' | 'HOTEL' | 'ACTIVITY';
  } | null>(null);
  const [filtersByTab, setFiltersByTab] = useState<Record<string, PlacesFilters>>({
    restaurants: { ...DEFAULT_FILTERS },
    hotels:      { ...DEFAULT_FILTERS },
    attractions: { ...DEFAULT_FILTERS },
  });
  const [visibleCount, setVisibleCount] = useState<Record<string, number>>({
    restaurants: PAGE_SIZE,
    hotels: PAGE_SIZE,
    attractions: PAGE_SIZE,
  });

  const { data, isLoading, isError } = useQuery<RecommendationsData>({
    queryKey: ['recommendations', destination],
    queryFn: async () => {
      const res = await fetch(
        `/api/recommendations?destination=${encodeURIComponent(destination)}&limit=40`,
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  const tab = TABS.find((t) => t.key === activeTab)!;
  const filters = filtersByTab[activeTab] ?? DEFAULT_FILTERS;
  const allPlaces: PlaceSearchResult[] = data?.[activeTab] ?? [];
  const filteredPlaces = useMemo(() => applyFilters(allPlaces, filters), [allPlaces, filters]);
  const currentVisible = visibleCount[activeTab] ?? PAGE_SIZE;
  const visiblePlaces = filteredPlaces.slice(0, currentVisible);
  const hasMore = filteredPlaces.length > currentVisible;
  const activeFiltersCount = useMemo(() => countActiveFilters(filters), [filters]);

  function handleTabChange(key: typeof activeTab) {
    setActiveTab(key);
    // Each tab keeps its own filters — no reset needed
  }

  function handleFiltersChange(f: PlacesFilters) {
    setFiltersByTab((prev) => ({ ...prev, [activeTab]: f }));
    setVisibleCount((v) => ({ ...v, [activeTab]: PAGE_SIZE }));
  }

  function loadMore() {
    setVisibleCount((v) => ({
      ...v,
      [activeTab]: (v[activeTab] ?? PAGE_SIZE) + PAGE_SIZE,
    }));
  }

  return (
    <div className="space-y-4">
      {/* Tab pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map((tb) => {
          const Icon = tb.icon;
          const count = data?.[tb.key]?.length;
          return (
            <button
              key={tb.key}
              onClick={() => handleTabChange(tb.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tb.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t(locale, tb.labelKey as any)}
              {count != null && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tb.key ? 'bg-white/20' : 'bg-background'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter bar — only shown when data is loaded */}
      {!isLoading && !isError && allPlaces.length > 0 && (
        <PlacesFilter
          filters={filters}
          onChange={handleFiltersChange}
          totalCount={allPlaces.length}
          filteredCount={filteredPlaces.length}
        />
      )}

      {/* Content */}
      {isLoading && <LoadingSkeleton />}

      {isError && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Adicione <code className="bg-muted px-1.5 py-0.5 rounded text-xs">GOOGLE_PLACES_API_KEY</code> no{' '}
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs">.env.local</code> para ver recomendações.
          </p>
        </div>
      )}

      {!isLoading && !isError && (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            {filteredPlaces.length === 0 ? (
              <EmptyState
                tab={tab}
                destination={destination}
                locale={locale}
                hasFilters={activeFiltersCount > 0}
                onReset={() => handleFiltersChange(DEFAULT_FILTERS)}
              />
            ) : (
              <>
                {visiblePlaces.map((place, i) => (
                  <PlaceCard
                    key={place.place_id}
                    place={place}
                    favoriteType={tab.favoriteType}
                    locale={locale}
                    index={i}
                    onOpen={() =>
                      setSelectedPlace({
                        placeId: place.place_id,
                        name: place.name,
                        favoriteType: tab.favoriteType,
                      })
                    }
                  />
                ))}

                {/* Load more */}
                {hasMore && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={loadMore}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-border/80 hover:bg-muted/40 transition-all"
                  >
                    <ChevronDown className="w-4 h-4" />
                    Ver mais {filteredPlaces.length - currentVisible} lugares
                  </motion.button>
                )}

                {/* End of results indicator */}
                {!hasMore && filteredPlaces.length > PAGE_SIZE && (
                  <p className="text-center text-xs text-muted-foreground py-2">
                    {filteredPlaces.length} lugares encontrados
                  </p>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Place detail modal */}
      <AnimatePresence>
        {selectedPlace && (
          <PlaceDetailModal
            key={selectedPlace.placeId}
            placeId={selectedPlace.placeId}
            favoriteType={selectedPlace.favoriteType}
            fallbackName={selectedPlace.name}
            onClose={() => setSelectedPlace(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
