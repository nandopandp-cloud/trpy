'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MapPin, Utensils, Hotel, Zap,
  Youtube, Image as ImageIcon, Star, Trash2, Play, X, ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale, t } from '@/lib/i18n';
import { PlaceDetailModal } from '@/components/integrations/google/place-detail-modal';

type FavoriteType = 'PLACE' | 'RESTAURANT' | 'HOTEL' | 'ACTIVITY' | 'VIDEO' | 'PIN';

interface Favorite {
  id: string;
  type: FavoriteType;
  externalId: string;
  name: string;
  image?: string;
  rating?: number;
  googlePlaceId?: string | null;
  youtubeVideoId?: string | null;
  pinterestPinId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

const TABS: { type: FavoriteType | 'ALL'; labelKey: string; icon: React.ElementType }[] = [
  { type: 'ALL', labelKey: 'favorites.all', icon: Heart },
  { type: 'PLACE', labelKey: 'favorites.places', icon: MapPin },
  { type: 'RESTAURANT', labelKey: 'favorites.restaurants', icon: Utensils },
  { type: 'HOTEL', labelKey: 'favorites.hotels', icon: Hotel },
  { type: 'ACTIVITY', labelKey: 'favorites.activities', icon: Zap },
  { type: 'VIDEO', labelKey: 'favorites.videos', icon: Youtube },
  { type: 'PIN', labelKey: 'favorites.pins', icon: ImageIcon },
];

const TYPE_COLOR: Record<FavoriteType, { text: string; bg: string }> = {
  PLACE: { text: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  RESTAURANT: { text: 'text-amber-400', bg: 'bg-amber-500/10' },
  HOTEL: { text: 'text-sky-400', bg: 'bg-sky-500/10' },
  ACTIVITY: { text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  VIDEO: { text: 'text-red-400', bg: 'bg-red-500/10' },
  PIN: { text: 'text-pink-400', bg: 'bg-pink-500/10' },
};

const TYPE_GRADIENT: Record<FavoriteType, string> = {
  PLACE: 'from-indigo-600 to-violet-700',
  RESTAURANT: 'from-amber-500 to-orange-600',
  HOTEL: 'from-sky-500 to-blue-600',
  ACTIVITY: 'from-emerald-500 to-green-600',
  VIDEO: 'from-red-500 to-rose-600',
  PIN: 'from-pink-500 to-fuchsia-600',
};

const TYPE_ICON: Record<FavoriteType, React.ElementType> = {
  PLACE: MapPin,
  RESTAURANT: Utensils,
  HOTEL: Hotel,
  ACTIVITY: Zap,
  VIDEO: Youtube,
  PIN: ImageIcon,
};

async function fetchFavorites(type?: FavoriteType): Promise<Favorite[]> {
  const params = type ? `?type=${type}` : '';
  const res = await fetch(`/api/favorites${params}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.error);
  return data.data;
}

async function removeFavoriteApi(externalId: string, type: FavoriteType) {
  const res = await fetch('/api/favorites', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, externalId }),
  });
  if (!res.ok) throw new Error('Erro ao remover favorito');
}

function FavoriteCard({ favorite, onRemove, onClick }: { favorite: Favorite; onRemove: () => void; onClick: () => void }) {
  const Icon = TYPE_ICON[favorite.type];
  const gradient = TYPE_GRADIENT[favorite.type];
  const colors = TYPE_COLOR[favorite.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onClick}
      className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      {/* Image or gradient */}
      <div className="relative h-36 overflow-hidden">
        {favorite.image ? (
          <img
            src={favorite.image}
            alt={favorite.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center relative', gradient)}>
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            <Icon className="w-10 h-10 text-white/80" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Remove button */}
        <motion.button
          initial={{ opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 z-10"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </motion.button>

        {/* Rating */}
        {favorite.rating && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs text-white font-medium">{favorite.rating}</span>
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <div className={cn('w-4 h-4 rounded-md flex items-center justify-center', colors.bg)}>
            <Icon className={cn('w-2.5 h-2.5', colors.text)} />
          </div>
          <span className="text-xs text-muted-foreground capitalize">
            {favorite.type.toLowerCase()}
          </span>
        </div>
        <p className="text-sm font-medium text-foreground line-clamp-2 leading-snug">{favorite.name}</p>
      </div>
    </motion.div>
  );
}

export default function FavoritesPage() {
  const [locale] = useLocale();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FavoriteType | 'ALL'>('ALL');
  const [selectedPlace, setSelectedPlace] = useState<{
    placeId: string;
    favoriteType: 'RESTAURANT' | 'HOTEL' | 'ACTIVITY' | 'PLACE';
    fallbackName: string;
  } | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Favorite | null>(null);
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', activeTab],
    queryFn: () => fetchFavorites(activeTab === 'ALL' ? undefined : activeTab),
  });

  const { data: stats = {} } = useQuery({
    queryKey: ['favorites-stats'],
    queryFn: async () => {
      const res = await fetch('/api/favorites/stats');
      const data = await res.json();
      return data.success ? data.data : {};
    },
  });

  const removeMutation = useMutation({
    mutationFn: ({ externalId, type }: { externalId: string; type: FavoriteType }) =>
      removeFavoriteApi(externalId, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorites-stats'] });
    },
  });

  const total = Object.values(stats as Record<string, number>).reduce((s, v) => s + v, 0);

  function handleCardClick(fav: Favorite) {
    // Places from Google Places API — open rich internal modal
    if (fav.type === 'RESTAURANT' || fav.type === 'HOTEL' || fav.type === 'ACTIVITY') {
      setSelectedPlace({
        placeId: fav.externalId,
        favoriteType: fav.type,
        fallbackName: fav.name,
      });
      return;
    }
    // PLACE — if it has a googlePlaceId (or externalId looks like a Google Place ID), open modal
    // Otherwise it's a favorited trip, navigate to the trip page
    if (fav.type === 'PLACE') {
      const googleId = fav.googlePlaceId || (fav.externalId.startsWith('ChIJ') ? fav.externalId : null);
      if (googleId) {
        setSelectedPlace({
          placeId: googleId,
          favoriteType: 'PLACE',
          fallbackName: fav.name,
        });
      } else {
        router.push(`/dashboard/trips/${fav.externalId}`);
      }
      return;
    }
    // YouTube video — open embedded player
    if (fav.type === 'VIDEO') {
      setSelectedVideo(fav);
      return;
    }
    // Pinterest — open in new tab (truly external)
    if (fav.type === 'PIN') {
      const pinId = fav.pinterestPinId || fav.externalId;
      if (pinId) window.open(`https://pinterest.com/pin/${pinId}/`, '_blank', 'noopener,noreferrer');
      return;
    }
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-medium text-foreground tracking-tight">{t(locale, 'favorites.title' as any)}</h1>
        <p className="text-sm text-muted-foreground">{t(locale, 'favorites.items_saved' as any).replace('{count}', String(total))}</p>
      </div>

      {/* Stats — compact row */}
      <div className="flex items-center gap-3 flex-wrap">
        {TABS.slice(1).map((tab) => {
          const count = (stats as Record<string, number>)[tab.type] ?? 0;
          const Icon = tab.icon;
          const colors = TYPE_COLOR[tab.type as FavoriteType];
          return (
            <motion.button
              key={tab.type}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab(tab.type)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl border transition-all',
                activeTab === tab.type
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border bg-card hover:border-zinc-300 dark:hover:border-border/80 hover:bg-zinc-50 dark:hover:bg-muted/30',
              )}
            >
              <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center', colors.bg)}>
                <Icon className={cn('w-3.5 h-3.5', colors.text)} />
              </div>
              <span className="text-sm font-medium text-foreground">{count}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">{t(locale, tab.labelKey as any)}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-border overflow-x-auto scroll-x-hidden -mb-px">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const count = tab.type === 'ALL' ? total : ((stats as Record<string, number>)[tab.type] ?? 0);
          return (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={cn(
                'flex items-center gap-1.5 pb-3 text-sm font-medium whitespace-nowrap transition-all border-b-2 shrink-0',
                activeTab === tab.type
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {t(locale, tab.labelKey as any)}
              {count > 0 && (
                <span className={cn(
                  'text-[10px] rounded-full px-1.5 py-0.5 font-normal',
                  activeTab === tab.type ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-52 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 py-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-zinc-50 dark:bg-muted flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <div>
            <p className="font-medium text-foreground">{t(locale, 'favorites.empty_title' as any)}</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              {t(locale, 'favorites.empty_desc' as any)}
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
        >
          <AnimatePresence mode="popLayout">
            {favorites.map((fav) => (
              <FavoriteCard
                key={fav.id}
                favorite={fav}
                onClick={() => handleCardClick(fav)}
                onRemove={() =>
                  removeMutation.mutate({ externalId: fav.externalId, type: fav.type })
                }
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
      </div>

      {/* Rich Place detail modal (restaurants, hotels, activities, places) */}
      <AnimatePresence>
        {selectedPlace && (
          <PlaceDetailModal
            key={selectedPlace.placeId}
            placeId={selectedPlace.placeId}
            favoriteType={selectedPlace.favoriteType}
            fallbackName={selectedPlace.fallbackName}
            onClose={() => setSelectedPlace(null)}
          />
        )}
      </AnimatePresence>

      {/* YouTube video player modal */}
      <VideoPlayerModal
        video={selectedVideo}
        onClose={() => setSelectedVideo(null)}
      />
    </>
  );
}

/* ─── Video Player Modal ──────────────────────────────── */

function VideoPlayerModal({ video, onClose }: { video: Favorite | null; onClose: () => void }) {
  useEffect(() => {
    if (!video) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [video, onClose]);

  const videoId = video
    ? video.youtubeVideoId ||
      (typeof video.metadata?.videoId === 'string' ? video.metadata.videoId : null) ||
      video.externalId
    : null;

  return (
    <AnimatePresence>
      {video && videoId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl rounded-3xl overflow-hidden bg-card border border-border shadow-2xl"
          >
            <div className="relative aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title={video.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
              <button
                onClick={onClose}
                aria-label="Close"
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/80 transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <Youtube className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">{video.name}</p>
                {typeof video.metadata?.channelTitle === 'string' && (
                  <p className="text-xs text-muted-foreground mt-1">{video.metadata.channelTitle}</p>
                )}
              </div>
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1.5 h-9 px-3 rounded-xl bg-muted hover:bg-muted/70 text-xs font-medium text-foreground transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                YouTube
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
