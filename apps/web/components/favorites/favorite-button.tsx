'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

type FavoriteType = 'PLACE' | 'RESTAURANT' | 'HOTEL' | 'ACTIVITY' | 'VIDEO' | 'PIN';

interface FavoriteButtonProps {
  type: FavoriteType;
  externalId: string;
  name: string;
  image?: string;
  rating?: number;
  metadata?: Record<string, unknown>;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
  className?: string;
}

export function FavoriteButton({
  type,
  externalId,
  name,
  image,
  rating,
  metadata,
  size = 'md',
  variant = 'icon',
  className,
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams({ type, externalId });
    fetch(`/api/favorites/check?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setIsFavorited(data.data.favorited);
      })
      .catch(() => {});
  }, [type, externalId]);

  async function toggle() {
    if (isLoading) return;
    setIsLoading(true);

    const nextState = !isFavorited;
    setIsFavorited(nextState);

    try {
      if (nextState) {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, externalId, name, image, rating, metadata }),
        });
      } else {
        await fetch('/api/favorites', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type, externalId }),
        });
      }
    } catch {
      setIsFavorited(!nextState);
    } finally {
      setIsLoading(false);
    }
  }

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
  const btnSize = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-12 h-12' : 'w-9 h-9';

  if (variant === 'button') {
    return (
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggle}
        disabled={isLoading}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all',
          isFavorited
            ? 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400'
            : 'bg-muted text-muted-foreground hover:text-foreground',
          className,
        )}
      >
        <Heart className={cn(iconSize, isFavorited && 'fill-current')} />
        {isFavorited ? 'Salvo' : 'Salvar'}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.85 }}
      onClick={toggle}
      disabled={isLoading}
      className={cn(
        'rounded-full flex items-center justify-center transition-all',
        btnSize,
        isFavorited
          ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
          : 'bg-black/30 backdrop-blur-sm text-white hover:bg-black/50',
        className,
      )}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isFavorited ? 'filled' : 'empty'}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Heart className={cn(iconSize, isFavorited && 'fill-current')} />
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}
