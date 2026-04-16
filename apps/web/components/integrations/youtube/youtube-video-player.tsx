'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, ExternalLink } from 'lucide-react';
import type { YouTubeVideo } from '@/lib/integrations/youtube/youtube-service';
import { cn } from '@/lib/utils';

interface YouTubeVideoPlayerProps {
  video: YouTubeVideo;
  className?: string;
}

export function YouTubeVideoPlayer({ video, className }: YouTubeVideoPlayerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Thumbnail card */}
      <motion.div
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className={cn('relative cursor-pointer rounded-2xl overflow-hidden group', className)}
      >
        <div className="relative aspect-video">
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />

          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg"
            >
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            </motion.div>
          </div>
        </div>

        <div className="p-3 bg-card border-t border-border">
          <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">{video.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{video.channelTitle}</p>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-3xl overflow-hidden bg-card shadow-2xl"
            >
              <div className="relative aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              <div className="p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground line-clamp-2">{video.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{video.channelTitle}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
