'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Sparkles, Plane, CheckCircle2, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface StoryItem {
  id: string;
  type: 'trip' | 'suggestion' | 'create';
  title: string;
  subtitle?: string;
  image?: string;
  gradient?: string;
  emoji?: string;
  status?: 'PLANNING' | 'ONGOING' | 'COMPLETED';
}

interface TripStoriesProps {
  trips?: Array<{
    id: string;
    title: string;
    destination: string;
    coverImage?: string | null;
    status: string;
  }>;
}

const STATUS_CONFIG = {
  PLANNING: {
    ring: 'from-indigo-500 via-violet-500 to-purple-500',
    icon: Clock,
    label: 'Planejando',
    dotColor: 'bg-indigo-400',
  },
  ONGOING: {
    ring: 'from-emerald-400 via-green-500 to-teal-500',
    icon: Plane,
    label: 'Em andamento',
    dotColor: 'bg-emerald-400',
  },
  COMPLETED: {
    ring: 'from-zinc-400 via-zinc-500 to-zinc-600',
    icon: CheckCircle2,
    label: 'Concluída',
    dotColor: 'bg-zinc-400',
  },
} as const;

const AI_SUGGESTIONS: StoryItem[] = [
  { id: 'ai-1', type: 'suggestion', title: 'Kyoto', subtitle: 'Sugestão IA', emoji: '⛩️', gradient: 'from-rose-600 to-pink-700' },
  { id: 'ai-2', type: 'suggestion', title: 'Maldivas', subtitle: 'Sugestão IA', emoji: '🏝️', gradient: 'from-cyan-500 to-blue-600' },
  { id: 'ai-3', type: 'suggestion', title: 'Marrocos', subtitle: 'Sugestão IA', emoji: '🕌', gradient: 'from-amber-600 to-orange-700' },
];

const GRADIENT_FALLBACKS = [
  'from-indigo-600 via-violet-600 to-purple-700',
  'from-sky-600 via-blue-600 to-indigo-700',
  'from-emerald-600 via-teal-600 to-cyan-700',
  'from-amber-600 via-orange-500 to-red-600',
  'from-rose-600 via-pink-600 to-fuchsia-700',
];

export function TripStories({ trips = [] }: TripStoriesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

  // Build story items
  const stories: StoryItem[] = [
    // Create new trip CTA
    { id: 'create', type: 'create', title: 'Nova viagem' },
    // User trips
    ...trips.map((trip, i) => ({
      id: trip.id,
      type: 'trip' as const,
      title: trip.destination,
      subtitle: trip.title,
      image: trip.coverImage ?? undefined,
      gradient: GRADIENT_FALLBACKS[i % GRADIENT_FALLBACKS.length],
      status: trip.status as StoryItem['status'],
    })),
    // AI suggestions (only if user has < 3 trips)
    ...(trips.length < 3 ? AI_SUGGESTIONS : []),
  ];

  function handleClick(story: StoryItem) {
    setViewedIds((prev) => new Set(prev).add(story.id));
    if (story.type === 'create') {
      router.push('/dashboard/trips/new');
    } else if (story.type === 'trip') {
      router.push(`/dashboard/trips/${story.id}`);
    } else {
      router.push('/dashboard/ai');
    }
  }

  return (
    <div className="relative">
      {/* Fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 px-4 md:px-6 snap-x snap-mandatory scroll-smooth"
      >
        {stories.map((story, i) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="snap-start shrink-0 flex flex-col items-center gap-2 cursor-pointer group"
            onClick={() => handleClick(story)}
          >
            {story.type === 'create' ? (
              <CreateStoryBubble />
            ) : (
              <StoryBubble
                story={story}
                viewed={viewedIds.has(story.id)}
              />
            )}
            <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[76px] text-center leading-tight">
              {story.title}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CreateStoryBubble() {
  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className="relative w-[72px] h-[72px] rounded-[22px] flex items-center justify-center"
    >
      {/* Dashed border */}
      <div className="absolute inset-0 rounded-[22px] border-2 border-dashed border-muted-foreground/30 group-hover:border-primary/50 transition-colors" />

      {/* Inner */}
      <div className="w-[62px] h-[62px] rounded-[18px] bg-muted/50 dark:bg-muted/30 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
        <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </motion.div>
  );
}

function StoryBubble({ story, viewed }: { story: StoryItem; viewed: boolean }) {
  const statusConfig = story.status ? STATUS_CONFIG[story.status] : null;
  const isAiSuggestion = story.type === 'suggestion';
  const ringGradient = statusConfig?.ring ?? (isAiSuggestion ? 'from-indigo-500 via-purple-500 to-pink-500' : 'from-zinc-400 to-zinc-500');

  return (
    <motion.div
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.95 }}
      className="relative w-[72px] h-[72px]"
    >
      {/* Gradient ring */}
      <div
        className={cn(
          'absolute inset-0 rounded-[22px] bg-gradient-to-br p-[2.5px] transition-opacity duration-300',
          ringGradient,
          viewed && !statusConfig ? 'opacity-30' : 'opacity-100'
        )}
      >
        {/* Gap ring (background color) */}
        <div className="w-full h-full rounded-[20px] bg-background p-[2px]">
          {/* Image container */}
          <div className="w-full h-full rounded-[18px] overflow-hidden relative">
            {story.image ? (
              <img
                src={story.image}
                alt={story.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center', story.gradient)}>
                {story.emoji && <span className="text-2xl">{story.emoji}</span>}
              </div>
            )}

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

            {/* Status indicator dot */}
            {statusConfig && (
              <div className="absolute bottom-1 right-1">
                <span className="relative flex h-3 w-3">
                  {story.status === 'ONGOING' && (
                    <span className={cn('animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', statusConfig.dotColor)} />
                  )}
                  <span className={cn('relative inline-flex rounded-full h-3 w-3 border-2 border-background', statusConfig.dotColor)} />
                </span>
              </div>
            )}

            {/* AI sparkle badge */}
            {isAiSuggestion && (
              <div className="absolute top-1 right-1">
                <div className="w-5 h-5 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hover glow */}
      <div className={cn(
        'absolute inset-0 rounded-[22px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl',
        `bg-gradient-to-br ${ringGradient}`,
      )} style={{ transform: 'scale(0.8)', filter: 'blur(16px)' }} />
    </motion.div>
  );
}
