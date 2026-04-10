'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Star, MapPin, Clock, Phone, Globe, ChevronLeft, ChevronRight,
  ExternalLink, Navigation, Share2, Building2, Loader2, DollarSign,
  ChevronDown, SlidersHorizontal, Check,
} from 'lucide-react';
import { FavoriteButton } from '@/components/favorites/favorite-button';
import { GoogleMapView } from './google-map-view';
import { cn } from '@/lib/utils';
import type { PlaceDetails, PlaceReview } from '@/lib/integrations/google/places-service';

// ─── Props ────────────────────────────────────────────────────────────────────

type FavoriteType = 'RESTAURANT' | 'HOTEL' | 'ACTIVITY';

interface PlaceDetailModalProps {
  placeId: string;
  favoriteType: FavoriteType;
  /** Optional initial name to show instantly before data loads */
  fallbackName?: string;
  onClose: () => void;
}

const PRICE = ['', '$', '$$', '$$$', '$$$$'];

const TYPE_LABEL: Record<string, string> = {
  restaurant: 'Restaurante',
  cafe: 'Café',
  bar: 'Bar',
  bakery: 'Padaria',
  lodging: 'Hospedagem',
  hotel: 'Hotel',
  tourist_attraction: 'Atração turística',
  museum: 'Museu',
  art_gallery: 'Galeria',
  park: 'Parque',
  church: 'Igreja',
  shopping_mall: 'Shopping',
  night_club: 'Balada',
  spa: 'Spa',
  store: 'Loja',
  point_of_interest: 'Ponto de interesse',
};

function prettyType(types?: string[]) {
  if (!types?.length) return null;
  const match = types.find((t) => TYPE_LABEL[t]);
  return match ? TYPE_LABEL[match] : null;
}

// ─── Photo Gallery ────────────────────────────────────────────────────────────

function PhotoCarousel({ photos, name }: { photos: PlaceDetails['photos']; name: string }) {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!photos?.length) {
    return (
      <div className="w-full h-64 sm:h-80 bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
        <Building2 className="w-12 h-12 text-muted-foreground/40" />
      </div>
    );
  }

  const total = photos.length;

  function scrollTo(i: number) {
    const clamped = (i + total) % total;
    setIndex(clamped);
    const el = scrollRef.current;
    if (el) {
      const slide = el.children[clamped] as HTMLElement | undefined;
      slide?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const slideWidth = el.clientWidth;
    const newIndex = Math.round(el.scrollLeft / slideWidth);
    if (newIndex !== index) setIndex(newIndex);
  }

  return (
    <div className="relative w-full h-64 sm:h-80 bg-muted group">
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {photos.map((p, i) => (
          <div
            key={p.photo_reference}
            className="relative w-full h-full shrink-0 snap-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/place-photo?ref=${p.photo_reference}&maxwidth=1200`}
              alt={`${name} - foto ${i + 1}`}
              loading={i === 0 ? 'eager' : 'lazy'}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Gradient overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />

      {/* Arrows (desktop only) */}
      {total > 1 && (
        <>
          <button
            onClick={() => scrollTo(index - 1)}
            className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/20 items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Foto anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollTo(index + 1)}
            className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/20 items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Próxima foto"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {total > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 px-2.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md">
          {photos.slice(0, Math.min(total, 8)).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/50',
              )}
              aria-label={`Ir para foto ${i + 1}`}
            />
          ))}
          {total > 8 && <span className="text-[10px] text-white/80 ml-1">+{total - 8}</span>}
        </div>
      )}

      {/* Counter */}
      {total > 1 && (
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-semibold">
          {index + 1}/{total}
        </div>
      )}
    </div>
  );
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

function StarRow({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'lg' ? 'w-4 h-4' : size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(s, i <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40')}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review, index }: { review: PlaceReview; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.text && review.text.length > 240;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3) }}
      className="rounded-2xl border border-border bg-card p-4 space-y-3"
    >
      <div className="flex items-start gap-3">
        {review.profile_photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={review.profile_photo_url}
            alt={review.author_name}
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-border"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {review.author_name[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{review.author_name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <StarRow value={review.rating} />
            <span className="text-[11px] text-muted-foreground">{review.relative_time_description}</span>
          </div>
        </div>
      </div>

      {review.text && (
        <div className="space-y-1.5">
          <p
            className={cn(
              'text-sm text-foreground/80 leading-relaxed whitespace-pre-line',
              !expanded && isLong && 'line-clamp-4',
            )}
          >
            {review.text}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              {expanded ? 'Ler menos' : 'Ler mais'}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

type SortMode = 'relevant' | 'recent';

function ReviewsList({ reviews }: { reviews: PlaceReview[] }) {
  const [filter, setFilter] = useState<number | null>(null);
  const [sort, setSort] = useState<SortMode>('relevant');

  const filtered = useMemo(() => {
    let list = [...reviews];
    if (filter != null) list = list.filter((r) => Math.round(r.rating) === filter);
    if (sort === 'recent') list.sort((a, b) => b.time - a.time);
    return list;
  }, [reviews, filter, sort]);

  // Count per rating for filter chips
  const counts = useMemo(() => {
    const c: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rounded = Math.round(r.rating);
      if (c[rounded] != null) c[rounded]++;
    });
    return c;
  }, [reviews]);

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">Nenhuma avaliação disponível.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter(null)}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
            filter == null
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground',
          )}
        >
          Todas ({reviews.length})
        </button>
        {[5, 4, 3, 2, 1].map((r) => {
          const count = counts[r];
          if (count === 0) return null;
          return (
            <button
              key={r}
              onClick={() => setFilter(filter === r ? null : r)}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors',
                filter === r
                  ? 'bg-amber-400 text-zinc-900'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              {r} <Star className="w-3 h-3 fill-current" />
              <span className="opacity-70">({count})</span>
            </button>
          );
        })}

        <div className="flex-1" />

        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => setSort(sort === 'relevant' ? 'recent' : 'relevant')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-muted text-foreground hover:bg-muted/80 transition-colors"
          >
            <SlidersHorizontal className="w-3 h-3" />
            {sort === 'relevant' ? 'Relevantes' : 'Recentes'}
          </button>
        </div>
      </div>

      {/* List */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-muted-foreground text-center py-6"
          >
            Nenhuma avaliação nessa faixa.
          </motion.p>
        ) : (
          filtered.map((r, i) => <ReviewCard key={`${r.author_name}-${r.time}`} review={r} index={i} />)
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Add to Trip picker ───────────────────────────────────────────────────────

interface TripDay { id: string; dayNumber: number; date: string; title?: string | null }
interface TripLite { id: string; title: string; destination: string; itineraryDays?: TripDay[] }

function AddToTripPopover({
  place,
  favoriteType,
  onClose,
}: {
  place: PlaceDetails;
  favoriteType: FavoriteType;
  onClose: () => void;
}) {
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: trips, isLoading } = useQuery<TripLite[]>({
    queryKey: ['trips-list-lite'],
    queryFn: async () => {
      const res = await fetch('/api/trips');
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
  });

  const currentTrip = trips?.find((t) => t.id === selectedTrip);

  async function addToDay(dayId: string) {
    setLoading(true);
    try {
      const mappedType = favoriteType === 'HOTEL' ? 'HOTEL' : favoriteType === 'RESTAURANT' ? 'RESTAURANT' : 'ACTIVITY';
      const res = await fetch(`/api/trips/${selectedTrip}/itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayId,
          order: 0,
          type: mappedType,
          title: place.name,
          location: place.formatted_address,
          description: place.types?.slice(0, 3).join(', '),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      const { toast } = await import('sonner');
      toast.success('Adicionado à viagem!', { description: place.name });
      onClose();
    } catch (e) {
      const { toast } = await import('sonner');
      toast.error('Erro ao adicionar', { description: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 8 }}
      transition={{ duration: 0.18 }}
      className="absolute bottom-full left-0 right-0 mb-2 mx-5 rounded-2xl border border-border bg-popover shadow-2xl overflow-hidden z-10"
    >
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <p className="text-sm font-bold text-foreground">
          {selectedTrip ? 'Escolha o dia' : 'Escolha a viagem'}
        </p>
        {selectedTrip && (
          <button
            onClick={() => setSelectedTrip(null)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Voltar
          </button>
        )}
      </div>

      <div className="max-h-72 overflow-y-auto">
        {isLoading && (
          <div className="p-6 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!isLoading && !selectedTrip && trips && trips.length === 0 && (
          <div className="p-6 text-center text-xs text-muted-foreground">
            Nenhuma viagem encontrada. Crie uma primeiro.
          </div>
        )}

        {!isLoading && !selectedTrip && trips?.map((trip) => (
          <button
            key={trip.id}
            onClick={() => setSelectedTrip(trip.id)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/60 transition-colors text-left border-b border-border last:border-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{trip.title}</p>
              <p className="text-[11px] text-muted-foreground truncate">{trip.destination}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        ))}

        {selectedTrip && currentTrip && (
          <>
            {currentTrip.itineraryDays?.length === 0 && (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Essa viagem não tem dias ainda.
              </div>
            )}
            {currentTrip.itineraryDays?.map((day) => (
              <button
                key={day.id}
                disabled={loading}
                onClick={() => addToDay(day.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/60 transition-colors text-left border-b border-border last:border-0 disabled:opacity-50"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Dia {day.dayNumber} {day.title && `— ${day.title}`}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(day.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <Check className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100" />
              </button>
            ))}
          </>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function PlaceDetailModal({
  placeId,
  favoriteType,
  fallbackName,
  onClose,
}: PlaceDetailModalProps) {
  const [showAddToTrip, setShowAddToTrip] = useState(false);
  const [showAllHours, setShowAllHours] = useState(false);

  const { data: place, isLoading, isError } = useQuery<PlaceDetails>({
    queryKey: ['place-details', placeId],
    queryFn: async () => {
      const res = await fetch(`/api/places/${placeId}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    staleTime: 60 * 60 * 1000, // 1h
  });

  // Lock scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // ESC close
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const openNow = place?.opening_hours?.open_now;
  const typeLabel = prettyType(place?.types);
  const photoUrl = place?.photos?.[0]
    ? `/api/place-photo?ref=${place.photos[0].photo_reference}&maxwidth=600`
    : undefined;

  const mapMarkers = place?.geometry
    ? [{
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng,
        title: place.name,
        type: (favoriteType === 'ACTIVITY' ? 'ACTIVITY' : favoriteType) as 'ACTIVITY' | 'RESTAURANT' | 'HOTEL',
      }]
    : [];

  async function handleShare() {
    const url = place?.url ?? window.location.href;
    const title = place?.name ?? fallbackName ?? 'Local';
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      const { toast } = await import('sonner');
      toast.success('Link copiado!');
    }
  }

  function handleDirections() {
    if (!place?.geometry) return;
    const { lat, lng } = place.geometry.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${place.place_id}`;
    window.open(url, '_blank');
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: 48, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 48, scale: 0.97 }}
        transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
        className="w-full sm:max-w-2xl bg-card border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94dvh] relative"
      >
        {/* Close button (floating over hero) */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onClose}
          className="absolute top-3 left-3 z-20 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </motion.button>

        {/* Share button (floating over hero) */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={handleShare}
          className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white"
          aria-label="Compartilhar"
        >
          <Share2 className="w-4 h-4" />
        </motion.button>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">
          {/* Hero: photo carousel */}
          <div className="relative">
            {isLoading ? (
              <div className="w-full h-64 sm:h-80 bg-muted animate-pulse" />
            ) : (
              <PhotoCarousel photos={place?.photos} name={place?.name ?? fallbackName ?? ''} />
            )}

            {/* Title overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5 pointer-events-none">
              <div className="space-y-1.5">
                {typeLabel && (
                  <span className="inline-block px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-wider text-white">
                    {typeLabel}
                  </span>
                )}
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-lg">
                  {place?.name ?? fallbackName ?? (
                    <span className="inline-block w-48 h-8 bg-white/20 rounded animate-pulse" />
                  )}
                </h2>
                {place?.formatted_address && (
                  <p className="text-xs sm:text-sm text-white/85 flex items-start gap-1.5 drop-shadow">
                    <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{place.formatted_address}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Body content */}
          <div className="p-5 space-y-6">
            {isError && (
              <div className="rounded-2xl border border-dashed border-destructive/40 bg-destructive/5 p-6 text-center">
                <p className="text-sm text-destructive">Erro ao carregar detalhes do local.</p>
              </div>
            )}

            {/* Quick info bar */}
            {place && (
              <div className="grid grid-cols-3 gap-2">
                {/* Rating */}
                <div className="rounded-2xl bg-muted/50 border border-border p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-black text-foreground">
                      {place.rating?.toFixed(1) ?? '—'}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {place.user_ratings_total?.toLocaleString('pt-BR') ?? 0} avaliações
                  </p>
                </div>

                {/* Open now */}
                <div className="rounded-2xl bg-muted/50 border border-border p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Clock className={cn(
                      'w-3.5 h-3.5',
                      openNow == null ? 'text-muted-foreground' : openNow ? 'text-emerald-500' : 'text-red-500',
                    )} />
                    <span className={cn(
                      'text-sm font-black',
                      openNow == null ? 'text-foreground' : openNow ? 'text-emerald-500' : 'text-red-500',
                    )}>
                      {openNow == null ? '—' : openNow ? 'Aberto' : 'Fechado'}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Agora</p>
                </div>

                {/* Price */}
                <div className="rounded-2xl bg-muted/50 border border-border p-3 text-center">
                  <div className="flex items-center justify-center gap-0.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-sm font-black text-foreground">
                      {place.price_level != null ? PRICE[place.price_level] : '—'}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Faixa de preço</p>
                </div>
              </div>
            )}

            {/* Opening hours (collapsible) */}
            {place?.opening_hours?.weekday_text && place.opening_hours.weekday_text.length > 0 && (
              <div className="rounded-2xl border border-border overflow-hidden">
                <button
                  onClick={() => setShowAllHours((v) => !v)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">Horário de funcionamento</span>
                  </div>
                  <motion.div animate={{ rotate: showAllHours ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {showAllHours && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden border-t border-border"
                    >
                      <ul className="px-4 py-3 space-y-1.5">
                        {place.opening_hours.weekday_text.map((day, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex justify-between gap-3">
                            {(() => {
                              const [name, ...rest] = day.split(': ');
                              return (
                                <>
                                  <span className="font-semibold text-foreground">{name}</span>
                                  <span className="text-right">{rest.join(': ') || 'Fechado'}</span>
                                </>
                              );
                            })()}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Contact */}
            {place && (place.formatted_phone_number || place.website) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {place.formatted_phone_number && (
                  <a
                    href={`tel:${place.formatted_phone_number.replace(/\s/g, '')}`}
                    className="flex items-center gap-2.5 p-3 rounded-2xl border border-border bg-muted/30 hover:bg-muted/60 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Telefone</p>
                      <p className="text-xs font-semibold text-foreground truncate">{place.formatted_phone_number}</p>
                    </div>
                  </a>
                )}
                {place.website && (
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-2xl border border-border bg-muted/30 hover:bg-muted/60 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">Site</p>
                      <p className="text-xs font-semibold text-foreground truncate">
                        {new URL(place.website).hostname.replace('www.', '')}
                      </p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />
                  </a>
                )}
              </div>
            )}

            {/* Map preview */}
            {place?.geometry && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Localização</h3>
                  <button
                    onClick={handleDirections}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Navigation className="w-3 h-3" /> Como chegar
                  </button>
                </div>
                <GoogleMapView markers={mapMarkers} height="220px" zoom={15} />
              </div>
            )}

            {/* Reviews */}
            {place && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Avaliações
                  </h3>
                  {place.rating != null && (
                    <div className="flex items-center gap-1.5">
                      <StarRow value={place.rating} size="md" />
                      <span className="text-sm font-bold text-foreground">{place.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <ReviewsList reviews={place.reviews ?? []} />
              </div>
            )}

            {/* Google Maps link */}
            {place?.url && (
              <a
                href={place.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pt-2"
              >
                Ver no Google Maps <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Sticky footer CTAs */}
        {place && (
          <div className="relative shrink-0 border-t border-border bg-card/95 backdrop-blur-md px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <AnimatePresence>
              {showAddToTrip && (
                <AddToTripPopover
                  place={place}
                  favoriteType={favoriteType}
                  onClose={() => setShowAddToTrip(false)}
                />
              )}
            </AnimatePresence>
            <div className="flex gap-2">
              <FavoriteButton
                type={favoriteType}
                externalId={place.place_id}
                name={place.name}
                image={photoUrl}
                rating={place.rating}
                metadata={{ googlePlaceId: place.place_id, address: place.formatted_address }}
                variant="button"
                size="md"
                className="shrink-0"
              />
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleDirections}
                disabled={!place.geometry}
                className="flex items-center justify-center gap-1.5 px-3 h-11 rounded-xl bg-muted text-foreground text-sm font-semibold hover:bg-muted/80 transition-colors disabled:opacity-50"
              >
                <Navigation className="w-4 h-4" />
                <span className="hidden sm:inline">Rota</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowAddToTrip((v) => !v)}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
              >
                <Check className="w-4 h-4" />
                Adicionar à viagem
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
