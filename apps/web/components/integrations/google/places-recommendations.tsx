'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Clock, ExternalLink, Utensils, Hotel, Landmark, Building2 } from 'lucide-react';
import { FavoriteButton } from '@/components/favorites/favorite-button';
import type { PlaceSearchResult } from '@/lib/integrations/google/places-service';

interface RecommendationsData {
  restaurants: PlaceSearchResult[];
  hotels: PlaceSearchResult[];
  attractions: PlaceSearchResult[];
}

const TABS = [
  { key: 'restaurants', label: 'Restaurantes', icon: Utensils, favoriteType: 'RESTAURANT' },
  { key: 'hotels',      label: 'Hotéis',       icon: Hotel,    favoriteType: 'HOTEL' },
  { key: 'attractions', label: 'Atrações',     icon: Landmark, favoriteType: 'ACTIVITY' },
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
}: {
  place: PlaceSearchResult;
  favoriteType: 'RESTAURANT' | 'HOTEL' | 'ACTIVITY';
}) {
  const photo = place.photos?.[0];
  const photoUrl = photo
    ? `/api/place-photo?ref=${photo.photo_reference}&maxwidth=600`
    : null;

  const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 p-3 rounded-2xl bg-muted/50 border border-border hover:border-primary/30 transition-colors group"
    >
      {/* Thumbnail */}
      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-muted">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt={place.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <Building2 className="w-6 h-6 opacity-40" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-foreground leading-tight line-clamp-1">
            {place.name}
          </p>
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

        <div className="flex items-center gap-2 mt-1">
          {place.rating != null && (
            <div className="flex items-center gap-1">
              <StarRating value={place.rating} />
              <span className="text-xs text-muted-foreground">
                {place.rating.toFixed(1)}
                {place.user_ratings_total != null && (
                  <span className="ml-0.5">({place.user_ratings_total.toLocaleString('pt-BR')})</span>
                )}
              </span>
            </div>
          )}
          {place.price_level != null && (
            <span className="text-xs text-muted-foreground">{PRICE[place.price_level]}</span>
          )}
          {place.opening_hours?.open_now != null && (
            <span className={`text-xs font-medium flex items-center gap-1 ${place.opening_hours.open_now ? 'text-emerald-400' : 'text-red-400'}`}>
              <Clock className="w-3 h-3" />
              {place.opening_hours.open_now ? 'Aberto' : 'Fechado'}
            </span>
          )}
        </div>

        {place.formatted_address && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />
            {place.formatted_address}
          </p>
        )}

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1.5"
        >
          Ver no Maps <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </motion.div>
  );
}

function EmptyState({ tab, destination }: { tab: typeof TABS[number]; destination: string }) {
  const mapsQuery = encodeURIComponent(
    `${tab.label} em ${destination}`
  );
  const mapsUrl = `https://www.google.com/maps/search/${mapsQuery}`;
  const Icon = tab.icon;
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center space-y-3">
      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Nenhum resultado encontrado</p>
        <p className="text-xs text-muted-foreground mt-1">
          Não encontramos {tab.label.toLowerCase()} para este destino via API.
        </p>
      </div>
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
      >
        Buscar no Google Maps <ExternalLink className="w-3 h-3" />
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
  const [activeTab, setActiveTab] = useState<'restaurants' | 'hotels' | 'attractions'>('restaurants');

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
        {TABS.map((t) => {
          const Icon = t.icon;
          const count = data?.[t.key]?.length;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === t.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
              {count != null && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === t.key ? 'bg-white/20' : 'bg-background'}`}>
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
              <EmptyState tab={tab} destination={destination} />
            ) : (
              places.map((place) => (
                <PlaceCard
                  key={place.place_id}
                  place={place}
                  favoriteType={tab.favoriteType}
                />
              ))
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
