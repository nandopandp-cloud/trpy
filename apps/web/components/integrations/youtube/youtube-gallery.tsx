'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Youtube } from 'lucide-react';
import { YouTubeVideoPlayer } from './youtube-video-player';
import type { YouTubeVideo } from '@/lib/integrations/youtube/youtube-service';

interface YouTubeGalleryProps {
  destination: string;
  activity?: string;
}

export function YouTubeGallery({ destination, activity }: YouTubeGalleryProps) {
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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {videos.map((video, i) => (
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
  );
}
