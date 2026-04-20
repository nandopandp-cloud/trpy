'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Image as ImageIcon, ExternalLink } from 'lucide-react';
import type { PinterestPin } from '@/lib/integrations/pinterest/pinterest-service';

interface PinterestGalleryProps {
  destination: string;
  theme?: 'travel' | 'food' | 'architecture' | 'nature' | 'culture';
}

function PinterestPinCard({ pin, index }: { pin: PinterestPin; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group relative rounded-2xl overflow-hidden bg-muted break-inside-avoid"
    >
      {pin.image ? (
        <img
          src={pin.image}
          alt={pin.title ?? 'Pin'}
          className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
          style={{ aspectRatio: pin.width && pin.height ? `${pin.width}/${pin.height}` : 'auto' }}
        />
      ) : (
        <div className="aspect-square bg-muted flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
        </div>
      )}

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />

      {/* Actions */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {pin.link && (
          <a
            href={pin.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Title overlay */}
      {pin.title && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-xs text-white font-medium line-clamp-2">{pin.title}</p>
        </div>
      )}
    </motion.div>
  );
}

export function PinterestGallery({ destination, theme }: PinterestGalleryProps) {
  const { data: pins = [], isLoading } = useQuery<PinterestPin[]>({
    queryKey: ['pinterest-pins', destination, theme],
    queryFn: async () => {
      const params = new URLSearchParams({ destination });
      if (theme) params.set('theme', theme);
      const res = await fetch(`/api/pins/search?${params}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    staleTime: 60 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="columns-2 md:columns-3 gap-3 space-y-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-muted animate-pulse break-inside-avoid mb-3"
            style={{ height: `${120 + (i % 3) * 40}px` }}
          />
        ))}
      </div>
    );
  }

  if (pins.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
          <ImageIcon className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Nenhuma inspiração encontrada para {destination}</p>
      </div>
    );
  }

  return (
    <div className="columns-2 md:columns-3 gap-3">
      {pins.map((pin, i) => (
        <div key={pin.id} className="mb-3">
          <PinterestPinCard pin={pin} index={i} />
        </div>
      ))}
    </div>
  );
}
