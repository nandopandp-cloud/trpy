'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Star, MapPin, Utensils, Hotel, Zap, Youtube, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FavoriteType = 'PLACE' | 'RESTAURANT' | 'HOTEL' | 'ACTIVITY' | 'VIDEO' | 'PIN';

export interface FavoriteDetail {
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
  createdAt?: string;
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

const TYPE_LABEL: Record<FavoriteType, string> = {
  PLACE: 'Local',
  RESTAURANT: 'Restaurante',
  HOTEL: 'Hotel',
  ACTIVITY: 'Atividade',
  VIDEO: 'Vídeo',
  PIN: 'Pin',
};

function getExternalLink(favorite: FavoriteDetail): { url: string; label: string } | null {
  const meta = (favorite.metadata ?? {}) as Record<string, unknown>;
  const placeId =
    favorite.googlePlaceId ||
    (typeof meta.googlePlaceId === 'string' ? meta.googlePlaceId : null) ||
    (typeof meta.placeId === 'string' ? meta.placeId : null);
  const videoId =
    favorite.youtubeVideoId ||
    (typeof meta.youtubeVideoId === 'string' ? meta.youtubeVideoId : null) ||
    (typeof meta.videoId === 'string' ? meta.videoId : null);
  const pinId =
    favorite.pinterestPinId ||
    (typeof meta.pinterestPinId === 'string' ? meta.pinterestPinId : null) ||
    (typeof meta.pinId === 'string' ? meta.pinId : null);

  switch (favorite.type) {
    case 'RESTAURANT':
    case 'HOTEL':
    case 'ACTIVITY':
    case 'PLACE':
      if (placeId) {
        return {
          url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(favorite.name)}&query_place_id=${placeId}`,
          label: 'Abrir no Google Maps',
        };
      }
      return {
        url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(favorite.name)}`,
        label: 'Buscar no Google Maps',
      };
    case 'VIDEO':
      if (videoId) {
        return {
          url: `https://www.youtube.com/watch?v=${videoId}`,
          label: 'Assistir no YouTube',
        };
      }
      return null;
    case 'PIN':
      if (pinId) {
        return {
          url: `https://pinterest.com/pin/${pinId}/`,
          label: 'Ver no Pinterest',
        };
      }
      return null;
    default:
      return null;
  }
}

function formatMetadataValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return null;
}

function formatMetadataKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .trim()
    .toLowerCase();
}

interface FavoriteDetailModalProps {
  favorite: FavoriteDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FavoriteDetailModal({ favorite, isOpen, onClose }: FavoriteDetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const shouldRender = isOpen && favorite !== null;

  return (
    <AnimatePresence>
      {shouldRender && favorite && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-card border border-border rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <ModalBody favorite={favorite} onClose={onClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ModalBody({ favorite, onClose }: { favorite: FavoriteDetail; onClose: () => void }) {
  const Icon = TYPE_ICON[favorite.type];
  const colors = TYPE_COLOR[favorite.type];
  const externalLink = getExternalLink(favorite);
  const metadataEntries: Array<[string, string]> = favorite.metadata
    ? Object.entries(favorite.metadata)
        .map(([key, value]) => [key, formatMetadataValue(value)] as const)
        .filter((entry): entry is [string, string] => entry[1] !== null && entry[1].length > 0)
        .slice(0, 8)
    : [];

  return (
    <>
      {/* Image section */}
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-muted to-muted/50">
        {favorite.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={favorite.image}
            alt={favorite.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Rating badge */}
        {typeof favorite.rating === 'number' && favorite.rating > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-sm text-white font-semibold">{favorite.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Type badge */}
        <div className="flex items-center gap-2">
          <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center', colors.bg)}>
            <Icon className={cn('w-3.5 h-3.5', colors.text)} />
          </div>
          <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
            {TYPE_LABEL[favorite.type]}
          </span>
        </div>

        {/* Name */}
        <h2 className="text-2xl font-bold text-foreground leading-tight">
          {favorite.name}
        </h2>

        {/* Metadata */}
        {metadataEntries.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            {metadataEntries.map(([key, value]) => (
              <div key={key} className="flex items-start justify-between gap-4">
                <span className="text-xs font-medium text-muted-foreground capitalize shrink-0">
                  {formatMetadataKey(key)}
                </span>
                <span className="text-sm text-foreground text-right line-clamp-2">
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {externalLink && (
          <a
            href={externalLink.url}
            target="_blank"
            rel="noreferrer noopener"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            {externalLink.label}
          </a>
        )}
      </div>
    </>
  );
}
