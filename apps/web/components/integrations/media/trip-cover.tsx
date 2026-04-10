'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TripCoverProps {
  /** Pre-saved cover URL (trip.coverImage). Preferred when present. */
  src?: string | null;
  /** Destination used for the gradient fallback label. */
  destination?: string;
  /** Children render on top of the image (title, dates, badges). */
  children?: React.ReactNode;
  className?: string;
  aspectClassName?: string;
}

/**
 * Renders a hero cover image for a trip. Gracefully falls back to a branded
 * gradient with the destination name when no image is available.
 */
export function TripCover({
  src,
  destination,
  children,
  className,
  aspectClassName = 'aspect-[21/9] sm:aspect-[3/1]',
}: TripCoverProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showImage = !!src && !failed;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl bg-card border border-border',
        aspectClassName,
        className,
      )}
    >
      {/* Gradient fallback — also used as the skeleton behind the image */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500',
          showImage && loaded ? 'opacity-0' : 'opacity-100',
          'transition-opacity duration-700',
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
        {!showImage && destination && (
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="flex items-center gap-2 text-white/90">
              <MapPin className="w-5 h-5" />
              <span className="text-lg font-semibold">{destination}</span>
            </div>
          </div>
        )}
      </div>

      {/* Cover image */}
      {showImage && (
        <motion.img
          key={src}
          src={src}
          alt={destination ?? 'Capa da viagem'}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: loaded ? 1 : 0, scale: loaded ? 1 : 1.05 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          loading="eager"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Dark gradient for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Content overlay */}
      {children && <div className="relative z-10 h-full">{children}</div>}
    </div>
  );
}
