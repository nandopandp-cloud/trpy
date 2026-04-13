'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, ExternalLink } from 'lucide-react';
import { useLocale, formatNumber } from '@/lib/i18n';
import type { PlaceDetails, PlaceReview } from '@/lib/integrations/google/places-service';

interface GoogleReviewsWidgetProps {
  placeId: string;
  placeName?: string;
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${s} ${star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground'}`}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review, index }: { review: PlaceReview; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-muted/40 rounded-2xl p-4 space-y-2"
    >
      <div className="flex items-start gap-3">
        {review.profile_photo_url ? (
          <img
            src={review.profile_photo_url}
            alt={review.author_name}
            className="w-8 h-8 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {review.author_name[0]?.toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground truncate">{review.author_name}</p>
            <span className="text-xs text-muted-foreground shrink-0">{review.relative_time_description}</span>
          </div>
          <StarRating rating={review.rating} />
        </div>
      </div>
      {review.text && (
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">{review.text}</p>
      )}
    </motion.div>
  );
}

export function GoogleReviewsWidget({ placeId, placeName }: GoogleReviewsWidgetProps) {
  const [locale] = useLocale();
  const { data: place, isLoading } = useQuery<PlaceDetails>({
    queryKey: ['place-details', placeId],
    queryFn: async () => {
      const res = await fetch(`/api/places/${placeId}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    enabled: !!placeId,
    staleTime: 60 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!place) return null;

  const reviews = place.reviews?.slice(0, 5) ?? [];

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center gap-4 bg-muted/30 rounded-2xl p-4">
        <div className="text-center">
          <p className="text-3xl font-black text-foreground">{place.rating?.toFixed(1)}</p>
          <StarRating rating={place.rating ?? 0} size="md" />
          <p className="text-xs text-muted-foreground mt-1">{place.user_ratings_total ? formatNumber(locale, place.user_ratings_total) : 0} avaliações</p>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = reviews.filter((r) => Math.round(r.rating) === stars).length;
            const pct = reviews.length ? (count / reviews.length) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-3">{stars}</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="h-full bg-amber-400 rounded-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="space-y-3">
          {reviews.map((review, i) => (
            <ReviewCard key={i} review={review} index={i} />
          ))}
        </div>
      )}

      {place.url && (
        <a
          href={place.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <ExternalLink className="w-3 h-3" />
          Ver no Google Maps
        </a>
      )}
    </div>
  );
}
