'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Star, MapPin, Utensils, Hotel, Zap, Youtube, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FavoriteType = 'PLACE' | 'RESTAURANT' | 'HOTEL' | 'ACTIVITY' | 'VIDEO' | 'PIN';

interface Favorite {
  id: string;
  type: FavoriteType;
  externalId: string;
  name: string;
  image?: string;
  rating?: number;
  googlePlaceId?: string;
  youtubeVideoId?: string;
  pinterestPinId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

const TYPE_ICON: Record<FavoriteType, React.ElementType> = {
  PLACE: MapPin,
  RESTAURANT: Utensils,
  HOTEL: Hotel,
  ACTIVITY: Zap,
  VIDEO: Youtube,
  PIN: ImageIcon,
};

const TYPE_COLOR: Record<FavoriteType, { text: string; bg: string }> = {
  PLACE: { text: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  RESTAURANT: { text: 'text-amber-400', bg: 'bg-amber-500/10' },
  HOTEL: { text: 'text-sky-400', bg: 'bg-sky-500/10' },
  ACTIVITY: { text: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  VIDEO: { text: 'text-red-400', bg: 'bg-red-500/10' },
  PIN: { text: 'text-pink-400', bg: 'bg-pink-500/10' },
};

function getExternalLink(favorite: Favorite): string | null {
  switch (favorite.type) {
    case 'RESTAURANT':
    case 'HOTEL':
    case 'ACTIVITY':
    case 'PLACE':
      return favorite.googlePlaceId
        ? `https://www.google.com/maps/search/?api=1&query=Google&query_place_id=${favorite.googlePlaceId}`
        : null;
    case 'VIDEO':
      return favorite.youtubeVideoId ? `https://www.youtube.com/watch?v=${favorite.youtubeVideoId}` : null;
    case 'PIN':
      return favorite.pinterestPinId ? `https://pinterest.com/pin/${favorite.pinterestPinId}/` : null;
    default:
      return null;
  }
}

interface FavoriteDetailModalProps {
  favorite: Favorite | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FavoriteDetailModal({ favorite, isOpen, onClose }: FavoriteDetailModalProps) {
  if (!favorite) return null;

  const Icon = TYPE_ICON[favorite.type];
  const colors = TYPE_COLOR[favorite.type];
  const externalLink = getExternalLink(favorite);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="w-full max-w-md bg-card border border-border rounded-3xl overflow-hidden shadow-2xl pointer-events-auto">
              {/* Image section */}
              <div className="relative h-56 overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                {favorite.image && (
                  <img
                    src={favorite.image}
                    alt={favorite.name}
                    className="w-full h-full object-cover"
                  />
                )}
                {!favorite.image && (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                )}

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Close button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </motion.button>

                {/* Rating badge */}
                {favorite.rating && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-sm text-white font-semibold">{favorite.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              {/* Content section */}
              <div className="p-6 space-y-4">
                {/* Type badge */}
                <div className="flex items-center gap-2 w-fit">
                  <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center', colors.bg)}>
                    <Icon className={cn('w-3.5 h-3.5', colors.text)} />
                  </div>
                  <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
                    {favorite.type.toLowerCase()}
                  </span>
                </div>

                {/* Name */}
                <div>
                  <h2 className="text-2xl font-bold text-foreground leading-tight">
                    {favorite.name}
                  </h2>
                </div>

                {/* Metadata */}
                {favorite.metadata && Object.keys(favorite.metadata).length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-border">
                    {Object.entries(favorite.metadata).map(([key, value]) => (
                      <div key={key} className="flex items-start justify-between gap-4">
                        <span className="text-xs font-medium text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm text-foreground text-right max-w-xs">
                          {typeof value === 'string' ? value : JSON.stringify(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                {externalLink && (
                  <motion.a
                    href={externalLink}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-medium transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver no{' '}
                    {favorite.type === 'VIDEO'
                      ? 'YouTube'
                      : favorite.type === 'PIN'
                        ? 'Pinterest'
                        : 'Google Maps'}
                  </motion.a>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
