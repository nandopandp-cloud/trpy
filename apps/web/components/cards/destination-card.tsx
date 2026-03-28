'use client';

import { motion } from 'framer-motion';
import { Star, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DestinationCardProps {
  name: string;
  country: string;
  image?: string;
  category?: string;
  rating?: number;
  gradient?: string;
  emoji?: string;
  onClick?: () => void;
  index?: number;
}

const DEFAULT_GRADIENTS = [
  'from-emerald-600 to-teal-700',
  'from-sky-600 to-blue-700',
  'from-violet-600 to-purple-700',
  'from-rose-600 to-pink-700',
  'from-amber-600 to-orange-700',
];

export function DestinationCard({
  name,
  country,
  image,
  category,
  rating = 4.8,
  gradient,
  emoji,
  onClick,
  index = 0,
}: DestinationCardProps) {
  const bg = gradient ?? DEFAULT_GRADIENTS[index % DEFAULT_GRADIENTS.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="cursor-pointer group shrink-0 w-44"
    >
      {/* Image / gradient */}
      <div className="relative h-52 rounded-3xl overflow-hidden shadow-card-lg">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className={cn('w-full h-full bg-gradient-to-br flex items-end pb-3 pl-3', bg)}>
            {emoji && <span className="text-4xl">{emoji}</span>}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category badge */}
        {category && (
          <div className="absolute top-3 left-3">
            <span className="text-[10px] font-bold text-white/90 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/15">
              {category}
            </span>
          </div>
        )}

        {/* Rating */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/30 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-white/15">
          <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
          <span className="text-[10px] font-semibold text-white">{rating.toFixed(1)}</span>
        </div>

        {/* Name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-sm font-black text-white leading-tight">{name}</p>
        </div>
      </div>

      {/* Country label */}
      <div className="mt-2 flex items-center gap-1.5 px-1">
        <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
        <p className="text-xs text-muted-foreground truncate">{country}</p>
      </div>
    </motion.div>
  );
}
