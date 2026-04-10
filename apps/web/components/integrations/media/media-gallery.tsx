'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Images, Film, ImageOff, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMediaImages, useMediaVideos } from './use-media';
import { ImageCard } from './image-card';
import { VideoCard } from './video-card';
import type { MediaItem } from '@/lib/integrations/media';
import { cn } from '@/lib/utils';

interface MediaGalleryProps {
  /** Destination or free-form query — the engine runs smart expansion. */
  query: string;
  /** Show images, videos, or both (tabs). */
  kind?: 'images' | 'videos' | 'both';
  className?: string;
}

type ActiveTab = 'images' | 'videos';

export function MediaGallery({ query, kind = 'both', className }: MediaGalleryProps) {
  const [tab, setTab] = useState<ActiveTab>(kind === 'videos' ? 'videos' : 'images');
  const [lightbox, setLightbox] = useState<{ items: MediaItem[]; index: number } | null>(null);

  const showTabs = kind === 'both';
  const showImages = tab === 'images' || kind === 'images';
  const showVideos = tab === 'videos' || kind === 'videos';

  const images = useMediaImages({
    query,
    perPage: 12,
    enabled: showImages,
  });
  const videos = useMediaVideos({
    query,
    perPage: 8,
    enabled: showVideos,
  });

  const loading = (showImages && images.isLoading) || (showVideos && videos.isLoading);
  const currentItems = showImages ? images.data?.items ?? [] : videos.data?.items ?? [];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Tabs */}
      {showTabs && (
        <div className="flex gap-2">
          <TabPill active={tab === 'images'} onClick={() => setTab('images')} icon={Images}>
            Fotos
          </TabPill>
          <TabPill active={tab === 'videos'} onClick={() => setTab('videos')} icon={Film}>
            Vídeos
          </TabPill>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <GallerySkeleton />
      ) : currentItems.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          className={cn(
            'grid gap-3 sm:gap-4',
            showVideos
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
          )}
        >
          {currentItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
            >
              {item.type === 'image' ? (
                <ImageCard
                  item={item}
                  onClick={() => setLightbox({ items: currentItems, index: i })}
                />
              ) : (
                <VideoCard
                  item={item}
                  onClick={() => setLightbox({ items: currentItems, index: i })}
                />
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <Lightbox
            items={lightbox.items}
            index={lightbox.index}
            onChangeIndex={(i) => setLightbox({ items: lightbox.items, index: i })}
            onClose={() => setLightbox(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Pieces ──────────────────────────────────────────────────────────────────

function TabPill({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-muted/80',
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {children}
    </button>
  );
}

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-video rounded-3xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-border bg-card/50 py-12 px-6 flex flex-col items-center justify-center gap-3 text-center">
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
        <ImageOff className="w-5 h-5 text-muted-foreground" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">Nenhuma mídia encontrada</p>
        <p className="text-xs text-muted-foreground mt-1">
          Tente buscar por outro destino ou termo mais específico.
        </p>
      </div>
    </div>
  );
}

function Lightbox({
  items,
  index,
  onChangeIndex,
  onClose,
}: {
  items: MediaItem[];
  index: number;
  onChangeIndex: (i: number) => void;
  onClose: () => void;
}) {
  const item = items[index];
  if (!item) return null;

  const prev = () => onChangeIndex((index - 1 + items.length) % items.length);
  const next = () => onChangeIndex((index + 1) % items.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
        aria-label="Fechar"
      >
        <X className="w-5 h-5" />
      </button>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            aria-label="Próximo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      <motion.div
        key={item.id}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
        className="relative max-w-6xl w-full max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === 'image' ? (
          <img
            src={item.url}
            alt={item.author.name}
            className="max-w-full max-h-[85vh] object-contain rounded-2xl"
          />
        ) : (
          <video
            src={item.url}
            poster={item.preview}
            controls
            autoPlay
            playsInline
            className="max-w-full max-h-[85vh] rounded-2xl bg-black"
          />
        )}

        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
              {item.source}
            </p>
            <p className="text-sm font-medium truncate">{item.author.name}</p>
          </div>
          <p className="text-xs font-mono text-white/60">
            {index + 1} / {items.length}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
