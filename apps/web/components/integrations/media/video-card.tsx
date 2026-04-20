'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Volume2, VolumeX } from 'lucide-react';
import type { MediaItem } from '@/lib/integrations/media';
import { cn } from '@/lib/utils';
import { FavoriteButton } from '@/components/favorites/favorite-button';

interface VideoCardProps {
  item: MediaItem;
  onClick?: (item: MediaItem) => void;
  /** On desktop we autoplay muted on hover. On mobile we show poster + tap-to-play. */
  className?: string;
  /** Hide favorite button */
  hideFavorite?: boolean;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function VideoCard({ item, onClick, className, hideFavorite = false }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [posterLoaded, setPosterLoaded] = useState(false);

  function handleEnter() {
    const v = videoRef.current;
    if (!v) return;
    v.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }

  function handleLeave() {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
    setPlaying(false);
  }

  return (
    <motion.div
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', bounce: 0.18, duration: 0.45 }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={() => onClick?.(item)}
      className={cn(
        'group relative overflow-hidden rounded-3xl bg-card border border-border shadow-sm aspect-video cursor-pointer',
        className,
      )}
    >
      {/* Poster skeleton */}
      {!posterLoaded && (
        <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden />
      )}

      {/* Poster image */}
      <img
        src={item.preview}
        alt={item.author.name}
        loading="lazy"
        decoding="async"
        onLoad={() => setPosterLoaded(true)}
        className={cn(
          'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
          playing ? 'opacity-0' : 'opacity-100',
          posterLoaded ? '' : 'opacity-0',
        )}
      />

      {/* Video (hidden until hover-play) */}
      <video
        ref={videoRef}
        src={item.url}
        muted={muted}
        loop
        playsInline
        preload="none"
        className={cn(
          'absolute inset-0 w-full h-full object-cover transition-opacity duration-500',
          playing ? 'opacity-100' : 'opacity-0',
        )}
      />

      {/* Play glyph */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary/90 transition-colors">
            <Play className="w-6 h-6 text-white ml-0.5" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Bottom caption strip */}
      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">
              {item.source}
            </p>
            <p className="text-xs font-medium text-white truncate">{item.author.name}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {item.duration && (
              <span className="text-[10px] font-mono font-semibold text-white bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
                {formatDuration(item.duration)}
              </span>
            )}
            {!hideFavorite && (
              <FavoriteButton
                type="VIDEO"
                externalId={item.id}
                name={item.author.name}
                youtubeVideoId={item.id}
                className="w-7 h-7"
              />
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMuted((m) => !m);
              }}
              className="w-7 h-7 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition-colors"
              aria-label={muted ? 'Ativar som' : 'Silenciar'}
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
