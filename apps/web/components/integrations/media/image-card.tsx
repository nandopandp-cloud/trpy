'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import type { MediaItem } from '@/lib/integrations/media';
import { cn } from '@/lib/utils';

interface ImageCardProps {
  item: MediaItem;
  onClick?: (item: MediaItem) => void;
  aspect?: 'square' | 'video' | 'portrait';
  className?: string;
}

const ASPECT = {
  square: 'aspect-square',
  video: 'aspect-video',
  portrait: 'aspect-[3/4]',
} as const;

export function ImageCard({ item, onClick, aspect = 'video', className }: ImageCardProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
      onClick={() => onClick?.(item)}
      className={cn(
        'group relative overflow-hidden rounded-3xl bg-card border border-border shadow-sm text-left',
        ASPECT[aspect],
        className,
      )}
      style={
        item.blurHash && !loaded
          ? { backgroundColor: item.blurHash.startsWith('#') ? item.blurHash : undefined }
          : undefined
      }
    >
      {/* Skeleton shimmer while loading */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden />
      )}

      <img
        src={item.preview}
        alt={item.location ?? item.author.name}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          'absolute inset-0 w-full h-full object-cover transition-all duration-700',
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105',
          'group-hover:scale-105',
        )}
      />

      {/* Gradient overlay for author / caption */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
            {item.source}
          </p>
          <p className="text-xs font-medium text-white truncate">{item.author.name}</p>
        </div>
        {item.author.url && (
          <a
            href={item.author.url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition-colors shrink-0"
            aria-label="Ver autor"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </motion.button>
  );
}
