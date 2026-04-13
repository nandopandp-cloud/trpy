'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Clock, ExternalLink, Utensils, Hotel, Landmark, Building2, ChevronRight } from 'lucide-react';
import { FavoriteButton } from '@/components/favorites/favorite-button';
import { PlaceDetailModal } from './place-detail-modal';
import type { PlaceSearchResult } from '@/lib/integrations/google/places-service';
import { useLocale, t, formatNumber, type Locale } from '@/lib/i18n';

interface RecommendationsData {
  restaurants: PlaceSearchResult[];
  hotels: PlaceSearchResult[];
  attractions: PlaceSearchResult[];
}

const TABS = [
  { key: 'restaurants', labelKey: 'places.restaurants', icon: Utensils, favoriteType: 'RESTAURANT' },
  { key: 'hotels',      labelKey: 'places.hotels',       icon: Hotel,    favoriteType: 'HOTEL' },
  { key: 'attractions', labelKey: 'places.attractions',     icon: Landmark, favoriteType: 'ACTIVITY' },
] as const;

const PRICE = ['', '$', '$$', '$$$', '$$$$'];

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
}: {
  place: PlaceSearchResult;
  favoriteType: 'RESTAURANT' | 'HOTEL' | 'ACTIVITY';
  locale: Locale;
  onOpen: () => void;
}) {
  const photo = place.photos?.[0];
  const photoUrl = photo
    ? `/api/place-photo?ref=${photo.photo_reference}&maxwidth=600`
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onOpen}
      className="flex gap-3 p-3 rounded-2xl bg-muted/50 border border-border hover:border-primary/40 hover:bg-muted/70 transition-all cursor-pointer group"
    >
      {/* Thumbnail */}
      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-muted">
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

        <div className="flex items-center gap-2 mt-1">
          {place.rating != null && (
            <div className="flex items-center gap-1">
              <StarRating value={place.rating} />
              <span className="text-xs text-muted-foreground">
                {place.rating.toFixed(1)}
                {place.user_ratings_total != null && (
                  <span className="ml-0.5">({formatNumber(locale, place.user_ratings_total)})</span>
                )}
              </span>
            </div>
          )}
          {place.price_level != null && (
            <span className="text-xs text-muted-foreground">{PRICE[place.price_level]}</span>
          )}
          {place.opening_hours?.open_now != null && (
            <span className={`text-xs font-medium flex items-center gap-1 ${place.opening_hours.open_now ? 'text-emerald-500' : 'text-red-500'}`}>
              <Clock className="w-3 h-3" />
              {place.opening_hours.open_now ? t(locale as any, 'places.open' as any) : t(locale as any, 'places.closed' as any)}
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

function EmptyState({ tab, destination, locale }: { tab: typeof TABS[number]; destination: string; locale: Locale }) {
  const tabLabel = t(locale as any, tab.labelKey as any);
  const mapsQuery = encodeURIComponent(
    `${tabLabel} ${destination}`
  );
  const mapsUrl = `https://www.google.com/maps/search/${mapsQuery}`;
  const Icon = tab.icon;
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-3">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{t(locale as any, 'places.empty' as any)}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {t(locale as any, 'places.no_results_for' as any).replace('{label}', tabLabel.toLowerCase())}
        </p>
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
      {[...Array(5)].map((_, i) => (
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

export function PlacesRecommendations({ destination }: { destination: string }) {
  const [locale] = useLocale();
  const [activeTab, setActiveTab] = useState<'restaurants' | 'hotels' | 'attractions'>('restaurants');
  const [selectedPlace, setSelectedPlace] = useState<{
    placeId: string;
    name: string;
    favoriteType: 'RESTAURANT' | 'HOTEL' | 'ACTIVITY';
  } | null>(null);

  const { data, isLoading, isError } = useQuery<RecommendationsData>({
    queryKey: ['recommendations', destination],
    queryFn: async () => {
      const res = await fetch(`/api/recommendations?destination=${encodeURIComponent(destination)}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  const tab = TABS.find((t) => t.key === activeTab)!;
  const places: PlaceSearchResult[] = data?.[activeTab] ?? [];

  return (
    <div className="space-y-4">
      {/* Tab pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((tb) => {
          const Icon = tb.icon;
          const count = data?.[tb.key]?.length;
          return (
            <button
              key={tb.key}
              onClick={() => setActiveTab(tb.key)}
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

      {/* Content */}
      {isLoading && <LoadingSkeleton />}

      {isError && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Adicione <code className="bg-muted px-1.5 py-0.5 rounded text-xs">GOOGLE_PLACES_API_KEY</code> no <code className="bg-muted px-1.5 py-0.5 rounded text-xs">.env.local</code> para ver recomendações.
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
            {places.length === 0 ? (
              <EmptyState tab={tab} destination={destination} locale={locale} />
            ) : (
              places.map((place) => (
                <PlaceCard
                  key={place.place_id}
                  place={place}
                  favoriteType={tab.favoriteType}
                  locale={locale}
                  onOpen={() =>
                    setSelectedPlace({
                      placeId: place.place_id,
                      name: place.name,
                      favoriteType: tab.favoriteType,
                    })
                  }
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Native place detail modal */}
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
