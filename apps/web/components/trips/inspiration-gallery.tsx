'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Loader2, Download, Heart } from 'lucide-react';
import { useMediaImages } from '@/components/integrations/media';
import type { MediaItem } from '@/components/integrations/media';
import { cn } from '@/lib/utils';

interface InspirationGalleryProps {
  destination: string;
}

export function InspirationGallery({ destination }: InspirationGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [liked, setLiked] = useState(new Set<string>());

  const { data, isLoading } = useMediaImages({
    query: destination,
    perPage: 20,
    orientation: 'landscape',
  });

  const items = data?.items ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
        </div>
        <p className="text-sm text-muted-foreground">Carregando inspirações...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
          <span className="text-xl">🖼️</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Nenhuma inspiração encontrada para "{destination}"
        </p>
      </div>
    );
  }

  function toggleLike(id: string) {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <>
      {/* Grid Gallery */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((item, idx) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.02, duration: 0.3 }}
            onClick={() => setSelectedIndex(idx)}
            className="group relative overflow-hidden rounded-2xl aspect-video cursor-pointer"
          >
            {/* Skeleton while image loads */}
            <div className="absolute inset-0 bg-muted animate-pulse" />

            {/* Image */}
            <img
              src={item.preview}
              alt={item.author.name}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Like button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(item.id);
              }}
              className={cn(
                'absolute top-2 right-2 w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-sm transition-all',
                liked.has(item.id)
                  ? 'bg-red-500/90 text-white'
                  : 'bg-black/40 text-white/60 hover:text-white hover:bg-black/60',
              )}
              aria-label="Marcar como favorita"
            >
              <Heart className={cn('w-4 h-4', liked.has(item.id) && 'fill-current')} />
            </motion.button>

            {/* Source badge */}
            <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg text-[10px] font-semibold bg-black/50 text-white/80 backdrop-blur-sm">
              {item.source === 'unsplash' ? '📸' : '🎥'} {item.source.charAt(0).toUpperCase() + item.source.slice(1)}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <Lightbox
            items={items}
            selectedIndex={selectedIndex}
            onChangeIndex={setSelectedIndex}
            onClose={() => setSelectedIndex(null)}
            liked={liked}
            onToggleLike={toggleLike}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Lightbox Component ───────────────────────────────────────────────────────

interface LightboxProps {
  items: MediaItem[];
  selectedIndex: number;
  onChangeIndex: (idx: number) => void;
  onClose: () => void;
  liked: Set<string>;
  onToggleLike: (id: string) => void;
}

function Lightbox({
  items,
  selectedIndex,
  onChangeIndex,
  onClose,
  liked,
  onToggleLike,
}: LightboxProps) {
  const item = items[selectedIndex];
  if (!item) return null;

  const prev = () => onChangeIndex((selectedIndex - 1 + items.length) % items.length);
  const next = () => onChangeIndex((selectedIndex + 1) % items.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
        aria-label="Fechar"
      >
        <X className="w-5 h-5" />
      </motion.button>

      {/* Image */}
      <motion.div
        key={item.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
        className="relative max-w-5xl w-full max-h-[85vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={item.url}
          alt={item.author.name}
          className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl"
        />
      </motion.div>

      {/* Navigation */}
      {items.length > 1 && (
        <>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Imagem anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            aria-label="Próxima imagem"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </>
      )}

      {/* Bottom info bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-5xl mx-auto flex items-end justify-between gap-4">
          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onToggleLike(item.id)}
              className={cn(
                'w-10 h-10 rounded-2xl flex items-center justify-center backdrop-blur-md border transition-all',
                liked.has(item.id)
                  ? 'bg-red-500/90 border-red-400/50 text-white'
                  : 'bg-white/10 border-white/20 text-white/70 hover:text-white hover:bg-white/20',
              )}
              aria-label="Marcar como favorita"
            >
              <Heart className={cn('w-5 h-5', liked.has(item.id) && 'fill-current')} />
            </motion.button>

            {item.author.url && (
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                href={item.author.url}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                aria-label="Ver no Unsplash/Pexels"
              >
                <Download className="w-5 h-5" />
              </motion.a>
            )}

            {/* Counter */}
            <span className="text-xs font-mono text-white/60 px-3 py-1 rounded-lg bg-white/5">
              {selectedIndex + 1} / {items.length}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
