'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Youtube, ChevronLeft, ChevronRight } from 'lucide-react';
import { YouTubeVideoPlayer } from './youtube-video-player';
import { cn } from '@/lib/utils';
import type { YouTubeVideo } from '@/lib/integrations/youtube/youtube-service';

interface YouTubeGalleryProps {
  destination: string;
  activity?: string;
}

const VIDEOS_PER_PAGE = 6;

export function YouTubeGallery({ destination, activity }: YouTubeGalleryProps) {
  const [currentPage, setCurrentPage] = useState(0);

  const { data: videos = [], isLoading } = useQuery<YouTubeVideo[]>({
    queryKey: ['youtube-videos', destination, activity],
    queryFn: async () => {
      const params = new URLSearchParams({ destination });
      if (activity) params.set('activity', activity);
      const res = await fetch(`/api/videos/search?${params}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    staleTime: 24 * 60 * 60 * 1000,
  });

  // Reset to page 0 when videos or destination change
  useEffect(() => {
    setCurrentPage(0);
  }, [destination, activity]);

  const totalPages = Math.ceil(videos.length / VIDEOS_PER_PAGE);
  const paginatedVideos = videos.slice(
    currentPage * VIDEOS_PER_PAGE,
    (currentPage + 1) * VIDEOS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-video rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
          <Youtube className="w-7 h-7 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Nenhum vídeo encontrado para {destination}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Videos Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {paginatedVideos.map((video, i) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <YouTubeVideoPlayer video={video} />
          </motion.div>
        ))}
      </div>

      {/* Pagination Controls */}
      {videos.length > VIDEOS_PER_PAGE && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all',
              currentPage === 0
                ? 'opacity-40 cursor-not-allowed bg-muted/30'
                : 'hover:bg-muted bg-muted/60 text-foreground'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </motion.button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setCurrentPage(i)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  'w-8 h-8 rounded-lg font-semibold text-xs transition-all',
                  currentPage === i
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-muted bg-muted/60 text-foreground'
                )}
              >
                {i + 1}
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all',
              currentPage === totalPages - 1
                ? 'opacity-40 cursor-not-allowed bg-muted/30'
                : 'hover:bg-muted bg-muted/60 text-foreground'
            )}
          >
            Próxima
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      )}
    </div>
  );
}
