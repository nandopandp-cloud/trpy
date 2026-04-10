'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MapPin, Utensils, Hotel, Zap,
  Youtube, Image as ImageIcon, Star, Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FavoriteDetailModal } from '@/components/favorites/favorite-detail-modal';

type FavoriteType = 'PLACE' | 'RESTAURANT' | 'HOTEL' | 'ACTIVITY' | 'VIDEO' | 'PIN';

interface Favorite {
  id: string;
  type: FavoriteType;
  externalId: string;
  name: string;
  image?: string;
  rating?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

const TABS: { type: FavoriteType | 'ALL'; label: string; icon: React.ElementType }[] = [
  { type: 'ALL', label: 'Todos', icon: Heart },
  { type: 'PLACE', label: 'Locais', icon: MapPin },
  { type: 'RESTAURANT', label: 'Restaurantes', icon: Utensils },
  { type: 'HOTEL', label: 'Hotéis', icon: Hotel },
  { type: 'ACTIVITY', label: 'Atividades', icon: Zap },
  { type: 'VIDEO', label: 'Vídeos', icon: Youtube },
  { type: 'PIN', label: 'Pins', icon: ImageIcon },
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
          onClick={onRemove}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
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
  const [activeTab, setActiveTab] = useState<FavoriteType | 'ALL'>('ALL');
  const [selectedFavorite, setSelectedFavorite] = useState<Favorite | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-medium text-foreground tracking-tight">Favoritos</h1>
        <p className="text-sm text-muted-foreground">{total} itens salvos</p>
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
              <span className="text-xs text-muted-foreground hidden sm:inline">{tab.label}</span>
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
              {tab.label}
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
            <p className="font-medium text-foreground">Nenhum favorito ainda</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              Explore locais, restaurantes e atividades para salvar seus preferidos
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
                onClick={() => {
                  setSelectedFavorite(fav);
                  setIsModalOpen(true);
                }}
                onRemove={() =>
                  removeMutation.mutate({ externalId: fav.externalId, type: fav.type })
                }
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
      </div>

      <FavoriteDetailModal
        favorite={selectedFavorite}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFavorite(null);
        }}
      />
    </>
  );
}
