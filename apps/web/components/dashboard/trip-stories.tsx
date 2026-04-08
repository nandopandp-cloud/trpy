'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, ChevronLeft, ChevronRight, Sparkles,
  ExternalLink, Play, MapPin, Volume2, VolumeX, Plane,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

/* ── Types ────────────────────────────────────────────── */

interface StoryItem {
  id: string;
  type: 'trip' | 'suggestion' | 'create';
  title: string;
  destination: string;
  subtitle?: string;
  coverImage?: string | null;
  gradient?: string;
  emoji?: string;
  status?: 'PLANNING' | 'ONGOING' | 'COMPLETED';
}

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  description: string;
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

/* ── Constants ────────────────────────────────────────── */

type SuggestionSeed = Omit<StoryItem, 'id'>;

const DESTINATION_POOL: SuggestionSeed[] = [
  { type: 'suggestion', title: 'Kyoto',       destination: 'Kyoto Japão',        subtitle: 'Japão',         emoji: '⛩️',  gradient: 'from-rose-600 to-pink-700' },
  { type: 'suggestion', title: 'Maldivas',    destination: 'Maldivas',            subtitle: 'Maldivas',      emoji: '🏝️',  gradient: 'from-cyan-500 to-blue-600' },
  { type: 'suggestion', title: 'Marrocos',    destination: 'Marrocos',            subtitle: 'Marrocos',      emoji: '🕌',  gradient: 'from-amber-600 to-orange-700' },
  { type: 'suggestion', title: 'Santorini',   destination: 'Santorini Grécia',    subtitle: 'Grécia',        emoji: '🏛️',  gradient: 'from-blue-500 to-cyan-600' },
  { type: 'suggestion', title: 'Bali',        destination: 'Bali Indonésia',      subtitle: 'Indonésia',     emoji: '🌺',  gradient: 'from-emerald-500 to-teal-600' },
  { type: 'suggestion', title: 'Patagônia',   destination: 'Patagônia Argentina', subtitle: 'Argentina',     emoji: '🏔️',  gradient: 'from-slate-500 to-slate-700' },
  { type: 'suggestion', title: 'Lisboa',      destination: 'Lisboa Portugal',     subtitle: 'Portugal',      emoji: '🏡',  gradient: 'from-yellow-500 to-orange-600' },
  { type: 'suggestion', title: 'Nova York',   destination: 'Nova York EUA',       subtitle: 'EUA',           emoji: '🗽',  gradient: 'from-sky-600 to-blue-700' },
  { type: 'suggestion', title: 'Tóquio',      destination: 'Tóquio Japão',        subtitle: 'Japão',         emoji: '🎌',  gradient: 'from-red-500 to-rose-700' },
  { type: 'suggestion', title: 'Islândia',    destination: 'Islândia',            subtitle: 'Islândia',      emoji: '🌋',  gradient: 'from-indigo-600 to-violet-700' },
  { type: 'suggestion', title: 'Dubai',       destination: 'Dubai Emirados',      subtitle: 'Emirados',      emoji: '🏙️',  gradient: 'from-amber-400 to-yellow-600' },
  { type: 'suggestion', title: 'Tailândia',   destination: 'Bangkok Tailândia',   subtitle: 'Tailândia',     emoji: '🛕',  gradient: 'from-orange-500 to-red-600' },
  { type: 'suggestion', title: 'Costa Rica',  destination: 'Costa Rica',          subtitle: 'Costa Rica',    emoji: '🦜',  gradient: 'from-green-500 to-emerald-700' },
  { type: 'suggestion', title: 'Paris',       destination: 'Paris França',        subtitle: 'França',        emoji: '🗼',  gradient: 'from-pink-500 to-rose-600' },
  { type: 'suggestion', title: 'Machu Picchu',destination: 'Machu Picchu Peru',   subtitle: 'Peru',          emoji: '🏯',  gradient: 'from-lime-600 to-green-700' },
  { type: 'suggestion', title: 'Safari Kenya',destination: 'Safári Quênia',       subtitle: 'Quênia',        emoji: '🦁',  gradient: 'from-yellow-600 to-amber-700' },
  { type: 'suggestion', title: 'Barcelona',   destination: 'Barcelona Espanha',   subtitle: 'Espanha',       emoji: '🎨',  gradient: 'from-red-500 to-yellow-500' },
  { type: 'suggestion', title: 'Amsterdã',    destination: 'Amsterdã Holanda',    subtitle: 'Holanda',       emoji: '🌷',  gradient: 'from-violet-500 to-purple-700' },
  { type: 'suggestion', title: 'Vancouver',   destination: 'Vancouver Canadá',    subtitle: 'Canadá',        emoji: '🍁',  gradient: 'from-red-600 to-rose-700' },
  { type: 'suggestion', title: 'Amalfi',      destination: 'Costa Amalfi Itália', subtitle: 'Itália',        emoji: '🍋',  gradient: 'from-yellow-400 to-orange-500' },
  { type: 'suggestion', title: 'Phuket',      destination: 'Phuket Tailândia',    subtitle: 'Tailândia',     emoji: '⛵',  gradient: 'from-teal-500 to-cyan-600' },
  { type: 'suggestion', title: 'Nepal',       destination: 'Katmandu Nepal',      subtitle: 'Nepal',         emoji: '🏔️',  gradient: 'from-orange-600 to-red-700' },
  { type: 'suggestion', title: 'Nova Zelândia',destination: 'Nova Zelândia',      subtitle: 'Nova Zelândia', emoji: '🐑',  gradient: 'from-green-600 to-teal-700' },
  { type: 'suggestion', title: 'Egipto',      destination: 'Cairo Egito',         subtitle: 'Egito',         emoji: '🐪',  gradient: 'from-amber-500 to-yellow-600' },
  { type: 'suggestion', title: 'Meksiko',     destination: 'Cidade do México',    subtitle: 'México',        emoji: '🌮',  gradient: 'from-green-500 to-red-600' },
  { type: 'suggestion', title: 'Seul',        destination: 'Seul Coreia do Sul',  subtitle: 'Coreia do Sul', emoji: '🌸',  gradient: 'from-pink-500 to-fuchsia-600' },
  { type: 'suggestion', title: 'Rio de Janeiro', destination: 'Rio de Janeiro Brasil', subtitle: 'Brasil',   emoji: '🎭',  gradient: 'from-green-500 to-yellow-500' },
  { type: 'suggestion', title: 'Singapura',   destination: 'Singapura',           subtitle: 'Singapura',     emoji: '🌃',  gradient: 'from-purple-600 to-blue-700' },
];

const SUGGESTIONS_CACHE_KEY = 'trpy_story_suggestions_v1';
const SUGGESTIONS_TTL = 12 * 60 * 60 * 1000; // 12 horas

function pickRandomDestinations(count: number): StoryItem[] {
  const shuffled = [...DESTINATION_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((s, i) => ({ ...s, id: `ai-${i}` }));
}

function useSuggestions(count = 8): StoryItem[] {
  const [suggestions, setSuggestions] = useState<StoryItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SUGGESTIONS_CACHE_KEY);
      if (raw) {
        const { items, ts } = JSON.parse(raw) as { items: StoryItem[]; ts: number };
        if (Date.now() - ts < SUGGESTIONS_TTL) {
          setSuggestions(items);
          return;
        }
      }
    } catch { /* ignore */ }

    const fresh = pickRandomDestinations(count);
    setSuggestions(fresh);
    try {
      localStorage.setItem(SUGGESTIONS_CACHE_KEY, JSON.stringify({ items: fresh, ts: Date.now() }));
    } catch { /* ignore */ }
  }, [count]);

  return suggestions;
}

const GRADIENT_FALLBACKS = [
  'from-indigo-600 via-violet-600 to-purple-700',
  'from-sky-600 via-blue-600 to-indigo-700',
  'from-emerald-600 via-teal-600 to-cyan-700',
  'from-amber-600 via-orange-500 to-red-600',
  'from-rose-600 via-pink-600 to-fuchsia-700',
];

const RING_GRADIENTS: Record<string, string> = {
  PLANNING: 'from-indigo-500 via-violet-500 to-purple-500',
  ONGOING:  'from-emerald-400 via-green-500 to-teal-400',
  COMPLETED:'from-zinc-400 to-zinc-500',
  suggestion: 'from-amber-400 via-orange-500 to-pink-500',
  trip: 'from-indigo-500 via-violet-500 to-purple-600',
};

/* ── Hook: destination photo ──────────────────────────── */

function useDestinationPhoto(destination: string, initial?: string | null) {
  const [photo, setPhoto] = useState<string | null>(initial ?? null);

  useEffect(() => {
    if (!destination || initial) return;
    fetch(`/api/destination-photo?q=${encodeURIComponent(destination)}`)
      .then(r => r.json())
      .then(d => { if (d.success && d.data?.photoUrl) setPhoto(d.data.photoUrl); })
      .catch(() => {});
  }, [destination, initial]);

  return photo;
}

/* ── Hook: YouTube videos ─────────────────────────────── */

function useStoryVideos(destination: string | null) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!destination) return;
    setLoading(true);
    setVideos([]);
    fetch(`/api/videos/search?destination=${encodeURIComponent(destination)}`)
      .then(r => r.json())
      .then(d => {
        if (d.success && Array.isArray(d.data)) setVideos(d.data.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [destination]);

  return { videos, loading };
}

/* ════════════════════════════════════════════════════════ */
/* STORY VIEWER                                            */
/* ════════════════════════════════════════════════════════ */

const STORY_DURATION = 12000; // ms per video
const TICK = 50;

interface StoryViewerProps {
  stories: StoryItem[];
  initialIndex: number;
  onClose: () => void;
  onNavigate?: (id: string) => void;
}

function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
  const router = useRouter();
  const [storyIdx, setStoryIdx] = useState(initialIndex);
  const [videoIdx, setVideoIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(true);
  const [showEmbed, setShowEmbed] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef(0);

  const currentStory = stories[storyIdx];
  const coverPhoto = useDestinationPhoto(currentStory.destination, currentStory.coverImage);
  const { videos, loading } = useStoryVideos(currentStory.destination);

  const currentVideo = videos[videoIdx] ?? null;
  const totalBars = Math.max(videos.length, 1);

  /* ── Progress timer ── */
  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    progressRef.current = 0;
    setProgress(0);

    intervalRef.current = setInterval(() => {
      progressRef.current += (TICK / STORY_DURATION) * 100;
      setProgress(progressRef.current);
      if (progressRef.current >= 100) advance();
    }, TICK);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyIdx, videoIdx]);

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  /* ── Navigation ── */
  const advance = useCallback(() => {
    stopTimer();
    setShowEmbed(false);
    if (videoIdx < videos.length - 1) {
      setVideoIdx(v => v + 1);
    } else if (storyIdx < stories.length - 1) {
      setStoryIdx(s => s + 1);
      setVideoIdx(0);
    } else {
      onClose();
    }
  }, [videoIdx, videos.length, storyIdx, stories.length, onClose]);

  const goBack = useCallback(() => {
    stopTimer();
    setShowEmbed(false);
    if (videoIdx > 0) {
      setVideoIdx(v => v - 1);
    } else if (storyIdx > 0) {
      setStoryIdx(s => s - 1);
      setVideoIdx(0);
    }
  }, [videoIdx, storyIdx]);

  const goToStory = (idx: number) => {
    stopTimer();
    setShowEmbed(false);
    setStoryIdx(idx);
    setVideoIdx(0);
  };

  /* ── Restart timer on index change ── */
  useEffect(() => {
    setShowEmbed(false);
    if (!loading) startTimer();
    return stopTimer;
  }, [storyIdx, videoIdx, loading]);

  useEffect(() => {
    if (!loading && videos.length > 0) startTimer();
    return stopTimer;
  }, [loading]);

  /* ── Keyboard ── */
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') advance();
      if (e.key === 'ArrowLeft') goBack();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [advance, goBack, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >

      {/* ── Left story arrow (desktop) ── */}
      {storyIdx > 0 && (
        <button
          onClick={e => { e.stopPropagation(); goToStory(storyIdx - 1); }}
          className="absolute left-4 md:left-[calc(50%-240px-60px)] w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition z-20"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
      )}

      {/* ── Story Card ── */}
      <motion.div
        key={storyIdx}
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        className="relative w-full max-w-[360px] h-[calc(100vh-40px)] max-h-[700px] rounded-3xl overflow-hidden shadow-2xl"
      >

        {/* ── BG: destination photo ── */}
        <div className="absolute inset-0">
          <AnimatePresence mode="sync">
            {coverPhoto ? (
              <motion.img
                key={coverPhoto}
                src={coverPhoto}
                alt={currentStory.title}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <motion.div
                key="gradient"
                className={cn('absolute inset-0 bg-gradient-to-br', currentStory.gradient ?? GRADIENT_FALLBACKS[0])}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
            )}
          </AnimatePresence>
          {/* Gradients overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        </div>

        {/* ── Progress Bars ── */}
        <div className="absolute top-3 inset-x-3 flex gap-1 z-30">
          {Array.from({ length: totalBars }).map((_, i) => (
            <div key={i} className="flex-1 h-[2.5px] rounded-full bg-white/25 overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                animate={{
                  width:
                    i < videoIdx ? '100%' :
                    i === videoIdx ? `${progress}%` :
                    '0%',
                }}
                transition={{ duration: 0 }}
              />
            </div>
          ))}
        </div>

        {/* ── Header ── */}
        <div className="absolute top-7 inset-x-4 flex items-center justify-between z-30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-white/40 shrink-0">
              {coverPhoto
                ? <img src={coverPhoto} alt="" className="w-full h-full object-cover" />
                : <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center', currentStory.gradient)}>
                    <span className="text-sm">{currentStory.emoji}</span>
                  </div>
              }
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-sm leading-none">{currentStory.title}</p>
              {currentStory.subtitle && (
                <p className="text-white/60 text-[10px] mt-0.5 flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5" />
                  {currentStory.subtitle}
                </p>
              )}
            </div>
            {currentStory.type === 'suggestion' && (
              <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                <Sparkles className="w-2.5 h-2.5" />IA
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={e => { e.stopPropagation(); setMuted(m => !m); }}
              className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition"
            >
              {muted
                ? <VolumeX className="w-3.5 h-3.5 text-white/80" />
                : <Volume2 className="w-3.5 h-3.5 text-white" />
              }
            </button>
            <button
              onClick={e => { e.stopPropagation(); onClose(); }}
              className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>

        {/* ── CENTER: Video area ── */}
        <div className="absolute inset-0 flex items-center justify-center px-4">
          {loading ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              <p className="text-white/60 text-xs font-light">Buscando vídeos...</p>
            </motion.div>
          ) : currentVideo && !showEmbed ? (
            /* ── Thumbnail card ── */
            <motion.div
              key={currentVideo.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative aspect-video">
                <img
                  src={currentVideo.thumbnail}
                  alt={currentVideo.title}
                  className="w-full h-full object-cover"
                />
                {/* Play button */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={e => {
                      e.stopPropagation();
                      stopTimer();
                      setShowEmbed(true);
                    }}
                    className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center shadow-2xl"
                  >
                    <Play className="w-7 h-7 text-zinc-900 ml-1" fill="currentColor" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : currentVideo && showEmbed ? (
            /* ── YouTube embed ── */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full rounded-2xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="aspect-video relative bg-black">
                <iframe
                  key={`${currentVideo.id}-${muted}`}
                  src={`https://www.youtube-nocookie.com/embed/${currentVideo.id}?autoplay=1&mute=${muted ? 1 : 0}&rel=0&modestbranding=1&playsinline=1&controls=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </motion.div>
          ) : null}
        </div>

        {/* ── BOTTOM: Video info ── */}
        {currentVideo && (
          <motion.div
            key={currentVideo.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="absolute bottom-0 inset-x-0 p-4 z-20"
          >
            <div className="bg-black/50 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <p className="text-white font-medium text-sm leading-snug line-clamp-2">{currentVideo.title}</p>
              <p className="text-white/50 text-[10px] mt-1">{currentVideo.channelTitle}</p>
              <div className="flex items-center gap-3 mt-3">
                <a
                  href={`https://www.youtube.com/watch?v=${currentVideo.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1.5 text-[11px] font-medium text-indigo-300 hover:text-indigo-200 transition"
                >
                  <ExternalLink className="w-3 h-3" />
                  Assistir no YouTube
                </a>
                {!showEmbed && (
                  <button
                    onClick={e => { e.stopPropagation(); stopTimer(); setShowEmbed(true); }}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-white/60 hover:text-white transition ml-auto"
                  >
                    <Play className="w-3 h-3" fill="currentColor" />
                    Reproduzir aqui
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAP ZONES (left = back, right = next) ── */}
        <div className="absolute inset-0 z-10 flex" style={{ pointerEvents: currentVideo && showEmbed ? 'none' : undefined }}>
          <div
            className="w-1/3 h-full"
            onClick={e => { e.stopPropagation(); goBack(); }}
          />
          <div
            className="w-2/3 h-full"
            onClick={e => { e.stopPropagation(); advance(); }}
          />
        </div>

      </motion.div>

      {/* ── Right story arrow (desktop) ── */}
      {storyIdx < stories.length - 1 && (
        <button
          onClick={e => { e.stopPropagation(); goToStory(storyIdx + 1); }}
          className="absolute right-4 md:right-[calc(50%-240px-60px)] w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/20 transition z-20"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      )}

      {/* ── Story strip (bottom previews on desktop) ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2 z-20">
        {stories.map((s, i) => (
          <button
            key={s.id}
            onClick={e => { e.stopPropagation(); goToStory(i); }}
            className={cn(
              'w-1.5 h-1.5 rounded-full transition-all duration-300',
              i === storyIdx ? 'bg-white scale-125' : 'bg-white/30 hover:bg-white/60'
            )}
          />
        ))}
      </div>

    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════ */
/* STORY BUBBLE                                            */
/* ════════════════════════════════════════════════════════ */

function StoryBubble({ story, viewed }: { story: StoryItem; viewed: boolean }) {
  const photo = useDestinationPhoto(story.destination, story.coverImage);

  const ring = story.status
    ? RING_GRADIENTS[story.status]
    : RING_GRADIENTS[story.type] ?? RING_GRADIENTS.trip;

  return (
    <motion.div
      whileHover={{ scale: 1.07, y: -3 }}
      whileTap={{ scale: 0.93 }}
      className="relative w-[80px] h-[80px]"
    >
      {/* Gradient ring */}
      <div
        className={cn(
          'absolute inset-0 rounded-[26px] bg-gradient-to-br transition-opacity duration-300',
          ring,
          viewed ? 'opacity-25' : 'opacity-100'
        )}
        style={{ padding: '2.5px' }}
      >
        {/* Gap (bg color) */}
        <div className="w-full h-full rounded-[24px] bg-background" style={{ padding: '2px' }}>
          {/* Cover image or gradient */}
          <div className="w-full h-full rounded-[22px] overflow-hidden relative">
            {photo ? (
              <img
                src={photo}
                alt={story.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center', story.gradient ?? GRADIENT_FALLBACKS[0])}>
                {story.emoji
                  ? <span className="text-2xl">{story.emoji}</span>
                  : <Plane className="w-6 h-6 text-white/60" />
                }
              </div>
            )}
            {/* Dark scrim */}
            <div className="absolute inset-0 bg-black/10 hover:bg-black/0 transition-colors" />

            {/* Status dot */}
            {story.status === 'ONGOING' && (
              <div className="absolute bottom-1.5 right-1.5">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-background" />
                </span>
              </div>
            )}

            {/* AI badge */}
            {story.type === 'suggestion' && (
              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-amber-300" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Glow on hover */}
      <div
        className={cn(
          'absolute inset-0 rounded-[26px] opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10',
          `bg-gradient-to-br ${ring}`
        )}
        style={{ filter: 'blur(12px)', transform: 'scale(0.85)' }}
      />
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════ */
/* CREATE BUBBLE                                           */
/* ════════════════════════════════════════════════════════ */

function CreateBubble() {
  return (
    <motion.div
      whileHover={{ scale: 1.07, y: -3 }}
      whileTap={{ scale: 0.93 }}
      className="relative w-[80px] h-[80px] rounded-[26px]"
    >
      {/* Dashed border */}
      <div className="absolute inset-0 rounded-[26px] border-2 border-dashed border-border/60 group-hover:border-primary/50 transition-colors" />
      {/* Inner */}
      <div className="absolute inset-[3px] rounded-[23px] bg-muted/40 group-hover:bg-primary/5 flex items-center justify-center transition-colors">
        <div className="w-8 h-8 rounded-full bg-background shadow-sm flex items-center justify-center ring-1 ring-border/60 group-hover:ring-primary/30 transition-all">
          <Plus className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════ */
/* MAIN: TripStories                                       */
/* ════════════════════════════════════════════════════════ */

export function TripStories({ trips = [] }: TripStoriesProps) {
  const router = useRouter();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());

  // 8 destinos aleatórios renovados a cada 12h
  const suggestions = useSuggestions(8);

  // Build story items (excluding "create" from viewer)
  const userStories: StoryItem[] = trips.map((trip, i) => ({
    id: trip.id,
    type: 'trip' as const,
    title: trip.destination,
    destination: trip.destination,
    subtitle: trip.title,
    coverImage: trip.coverImage,
    gradient: GRADIENT_FALLBACKS[i % GRADIENT_FALLBACKS.length],
    status: trip.status as StoryItem['status'],
  }));

  const aiStories = suggestions;
  const viewableStories = [...userStories, ...aiStories];

  // All bubbles (create + stories)
  const allBubbles: StoryItem[] = [
    { id: 'create', type: 'create', title: 'Nova viagem', destination: '' },
    ...viewableStories,
  ];

  function openStory(story: StoryItem) {
    if (story.type === 'create') {
      router.push('/dashboard/trips/new');
      return;
    }
    setViewedIds(prev => new Set(prev).add(story.id));
    const idx = viewableStories.findIndex(s => s.id === story.id);
    setActiveIdx(idx >= 0 ? idx : 0);
    setViewerOpen(true);
  }

  return (
    <>
      {/* ── Bubble strip ── */}
      <div className="relative -mx-4 md:-mx-6">
        {/* Fade masks */}
        <div className="absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 pt-1 px-4 md:px-6 snap-x snap-mandatory scroll-smooth">
          {allBubbles.map((story, i) => (
            <motion.button
              key={story.id}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="snap-start shrink-0 flex flex-col items-center gap-2 group"
              onClick={() => openStory(story)}
            >
              {story.type === 'create'
                ? <CreateBubble />
                : <StoryBubble story={story} viewed={viewedIds.has(story.id)} />
              }
              <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[80px] text-center leading-tight">
                {story.title}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Story viewer modal ── */}
      <AnimatePresence>
        {viewerOpen && viewableStories.length > 0 && (
          <StoryViewer
            stories={viewableStories}
            initialIndex={activeIdx}
            onClose={() => setViewerOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
