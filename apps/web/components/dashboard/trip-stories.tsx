'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, ChevronLeft, ChevronRight,
  ExternalLink, MapPin, Volume2, VolumeX, Plane,
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
/* STORY VIEWER  — Instagram-grade experience              */
/* ════════════════════════════════════════════════════════ */

const STORY_DURATION = 50000; // ms per video segment

interface StoryViewerProps {
  stories: StoryItem[];
  initialIndex: number;
  onClose: () => void;
}

/* ── Directional slide variants ── */
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-30%' : '30%', opacity: 0 }),
};

function StoryViewer({ stories, initialIndex, onClose }: StoryViewerProps) {
  const router = useRouter();

  /* ── Indices & direction ── */
  const [storyIdx, setStoryIdx] = useState(initialIndex);
  const [videoIdx, setVideoIdx] = useState(0);
  const directionRef = useRef(0);          // 1 = forward, -1 = backward

  /* ── RAF progress ── */
  const [progress, setProgress] = useState(0);
  const rafRef       = useRef<number | null>(null);
  const startTsRef   = useRef<number | null>(null);
  const savedPctRef  = useRef(0);          // progress saved before pause

  /* ── Pause / mute ── */
  const [isPaused, setIsPaused] = useState(false);
  const [muted, setMuted]       = useState(true);
  const isPausedRef = useRef(false);

  /* ── Touch gesture ── */
  type TouchState = { x: number; y: number; time: number };
  const touchRef    = useRef<TouchState | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didSwipeRef  = useRef(false);

  /* ── Video data ── */
  const currentStory = stories[storyIdx];
  const coverPhoto   = useDestinationPhoto(currentStory.destination, currentStory.coverImage);
  const { videos, loading } = useStoryVideos(currentStory.destination);

  const currentVideo = videos[videoIdx] ?? null;
  const totalBars    = Math.max(videos.length, 1);

  /* ══════════════════ RAF PROGRESS ══════════════════════ */

  const stopRaf = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const startRaf = useCallback(() => {
    stopRaf();
    startTsRef.current = null;

    function tick(ts: number) {
      if (isPausedRef.current) { rafRef.current = requestAnimationFrame(tick); return; }
      if (!startTsRef.current) startTsRef.current = ts;
      const elapsed = ts - startTsRef.current;
      const pct = Math.min(savedPctRef.current + (elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) { advanceFn(); return; }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyIdx, videoIdx]);

  const pauseRaf = useCallback(() => {
    isPausedRef.current = true;
    setIsPaused(true);
  }, []);

  const resumeRaf = useCallback(() => {
    isPausedRef.current = false;
    setIsPaused(false);
    // Reset start so elapsed time resets (progress saved in savedPctRef)
    startTsRef.current = null;
  }, []);

  /* ══════════════════ NAVIGATION ═══════════════════════ */

  // We define a stable ref-based advance so RAF tick can call it without stale closures
  const storyIdxRef  = useRef(storyIdx);
  const videoIdxRef  = useRef(videoIdx);
  const videosRef    = useRef(videos);
  const storiesRef   = useRef(stories);

  storyIdxRef.current  = storyIdx;
  videoIdxRef.current  = videoIdx;
  videosRef.current    = videos;
  storiesRef.current   = stories;

  const advanceFn = useCallback(() => {
    stopRaf();
    savedPctRef.current = 0;
    const vi = videoIdxRef.current;
    const si = storyIdxRef.current;
    const vlen = videosRef.current.length;
    const slen = storiesRef.current.length;

    directionRef.current = 1;
    if (vi < vlen - 1) {
      setVideoIdx(vi + 1);
    } else if (si < slen - 1) {
      setStoryIdx(si + 1);
      setVideoIdx(0);
    } else {
      onClose();
    }
  }, [stopRaf, onClose]);

  const goBackFn = useCallback(() => {
    stopRaf();
    savedPctRef.current = 0;
    const vi = videoIdxRef.current;
    const si = storyIdxRef.current;

    directionRef.current = -1;
    if (vi > 0) {
      setVideoIdx(vi - 1);
    } else if (si > 0) {
      setStoryIdx(si - 1);
      setVideoIdx(0);
    }
  }, [stopRaf]);

  const goToStory = useCallback((idx: number) => {
    stopRaf();
    savedPctRef.current = 0;
    directionRef.current = idx > storyIdxRef.current ? 1 : -1;
    setStoryIdx(idx);
    setVideoIdx(0);
  }, [stopRaf]);

  /* ── Start/restart progress when indices or loading changes ── */
  useEffect(() => {
    isPausedRef.current = false;
    setIsPaused(false);
    savedPctRef.current = 0;
    setProgress(0);
    if (!loading) startRaf();
    return stopRaf;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyIdx, videoIdx]);

  useEffect(() => {
    if (!loading && videos.length > 0) {
      savedPctRef.current = 0;
      startRaf();
    }
    return stopRaf;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowRight')  advanceFn();
      if (e.key === 'ArrowLeft')   goBackFn();
      if (e.key === ' ')           isPausedRef.current ? resumeRaf() : pauseRaf();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [advanceFn, goBackFn, onClose, pauseRaf, resumeRaf]);

  /* ══════════════════ TOUCH / GESTURE ══════════════════ */

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    didSwipeRef.current = false;
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };

    // Long-press → pause
    holdTimerRef.current = setTimeout(() => {
      pauseRaf();
    }, 150);
  }, [pauseRaf]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const dx = Math.abs(e.touches[0].clientX - touchRef.current.x);
    const dy = Math.abs(e.touches[0].clientY - touchRef.current.y);

    // If finger moved, cancel the hold timer
    if ((dx > 8 || dy > 8) && holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (dx > 10 || dy > 10) didSwipeRef.current = true;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    // Resuming from hold
    if (isPausedRef.current) {
      resumeRaf();
      touchRef.current = null;
      return;
    }

    if (!touchRef.current) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dy = e.changedTouches[0].clientY - touchRef.current.y;
    const dt = Date.now() - touchRef.current.time;
    touchRef.current = null;

    const velocity = Math.abs(dx) / dt; // px/ms

    // Horizontal swipe
    if (Math.abs(dx) > Math.abs(dy) * 1.2 && (velocity > 0.25 || Math.abs(dx) > 55)) {
      if (dx < 0) advanceFn(); else goBackFn();
      return;
    }

    // Swipe down → close
    if (dy > 100 && Math.abs(dy) > Math.abs(dx) * 1.5) {
      onClose();
      return;
    }

    // Tap (barely moved)
    if (!didSwipeRef.current) {
      const { clientX } = e.changedTouches[0];
      if (clientX < window.innerWidth * 0.35) goBackFn(); else advanceFn();
    }
  }, [advanceFn, goBackFn, onClose, resumeRaf]);

  /* Mouse support for desktop hold-to-pause */
  const onMouseDown = useCallback(() => {
    holdTimerRef.current = setTimeout(pauseRaf, 150);
  }, [pauseRaf]);
  const onMouseUp = useCallback(() => {
    if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = null; }
    if (isPausedRef.current) resumeRaf();
  }, [resumeRaf]);

  /* ══════════════════ RENDER ════════════════════════════ */

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
    >

      {/* ── Desktop: left/right arrows outside card ── */}
      <div className="hidden md:flex absolute inset-0 items-center justify-between px-4 z-40 pointer-events-none">
        <button
          onClick={() => goToStory(Math.max(0, storyIdx - 1))}
          style={{ pointerEvents: storyIdx > 0 ? 'auto' : 'none' }}
          className={cn(
            'w-11 h-11 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/25 transition',
            storyIdx === 0 && 'opacity-0'
          )}
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => goToStory(Math.min(stories.length - 1, storyIdx + 1))}
          style={{ pointerEvents: storyIdx < stories.length - 1 ? 'auto' : 'none' }}
          className={cn(
            'w-11 h-11 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-white/25 transition',
            storyIdx >= stories.length - 1 && 'opacity-0'
          )}
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* ════ STORY CARD — phone-like on desktop, full-screen on mobile ════ */}
      <div className="relative w-full h-full md:w-[420px] md:h-[calc(100dvh-32px)] md:max-h-[780px] md:rounded-[2rem] overflow-hidden md:shadow-2xl">

        {/* ── Animated story transition ── */}
        <AnimatePresence custom={directionRef.current} mode="sync">
          <motion.div
            key={`${storyIdx}-${videoIdx}`}
            custom={directionRef.current}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0"
          >
            {/* ─── LAYER 1: Blurred destination photo as BG ─── */}
            <div className="absolute inset-0 bg-black">
              {coverPhoto ? (
                <img
                  src={coverPhoto}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-50 pointer-events-none"
                  aria-hidden
                />
              ) : (
                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-70', currentStory.gradient ?? GRADIENT_FALLBACKS[0])} />
              )}
            </div>

            {/* ─── LAYER 2: YouTube iframe (fills frame, cover crop) ─── */}
            {currentVideo && (
              <div className="absolute inset-0 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.iframe
                    key={`${currentVideo.id}-${muted ? 'm' : 'u'}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    src={`https://www.youtube-nocookie.com/embed/${currentVideo.id}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&rel=0&playsinline=1&modestbranding=1&loop=0`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    /* Cover-crop: fill height, overflow width */
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      height: '100%',
                      aspectRatio: '16/9',
                      transform: 'translate(-50%, -50%)',
                      pointerEvents: 'none',  // gesture overlay handles all touches
                    }}
                  />
                </AnimatePresence>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
                <div className="w-10 h-10 rounded-full border-[3px] border-white/20 border-t-white animate-spin" />
                <p className="text-white/60 text-xs tracking-wide">Buscando vídeos…</p>
              </div>
            )}

            {/* No videos fallback — show cover photo large */}
            {!loading && !currentVideo && coverPhoto && (
              <img
                src={coverPhoto}
                alt={currentStory.title}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            )}

            {/* ─── LAYER 3: Gradient UI overlays ─── */}
            {/* Top scrim */}
            <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
            {/* Bottom scrim */}
            <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

            {/* ─── LAYER 4: Progress bars ─── */}
            <div className="absolute top-4 inset-x-4 flex gap-[3px] z-30 pointer-events-none">
              {Array.from({ length: totalBars }).map((_, i) => (
                <div key={i} className="flex-1 h-[2.5px] rounded-full bg-white/25 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full"
                    style={{
                      width:
                        i < videoIdx ? '100%' :
                        i === videoIdx ? `${progress}%` : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* ─── LAYER 5: Header ─── */}
            <div className="absolute top-10 inset-x-4 flex items-center justify-between z-30 pointer-events-none">
              {/* Left: avatar + info */}
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/50 shrink-0">
                  {coverPhoto
                    ? <img src={coverPhoto} alt="" className="w-full h-full object-cover" />
                    : <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center text-base', currentStory.gradient)}>
                        {currentStory.emoji}
                      </div>
                  }
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold text-[15px] leading-none drop-shadow">{currentStory.title}</p>
                  {currentStory.subtitle && (
                    <p className="text-white/70 text-[11px] mt-0.5 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 shrink-0" />
                      {currentStory.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: controls */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  onClick={e => { e.stopPropagation(); setMuted(m => !m); }}
                  className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 active:scale-90 transition"
                >
                  {muted
                    ? <VolumeX className="w-4 h-4 text-white/80" />
                    : <Volume2 className="w-4 h-4 text-white" />
                  }
                </button>
                <button
                  onClick={e => { e.stopPropagation(); onClose(); }}
                  className="w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 active:scale-90 transition"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* ─── LAYER 6: Bottom overlay ─── */}
            {currentVideo && (
              <motion.div
                key={currentVideo.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-0 inset-x-0 px-4 pb-8 pt-4 z-30 pointer-events-none"
              >
                <p className="text-white font-semibold text-[15px] leading-snug line-clamp-2 drop-shadow">{currentVideo.title}</p>
                <p className="text-white/60 text-[11px] mt-1">{currentVideo.channelTitle}</p>

                {/* CTA row */}
                <div className="flex items-center gap-3 mt-4 pointer-events-auto">
                  <a
                    href={`https://www.youtube.com/watch?v=${currentVideo.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 text-white text-[12px] font-medium px-4 py-2.5 rounded-full hover:bg-white/25 active:scale-95 transition"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Ver no YouTube
                  </a>
                  {currentStory.type === 'trip' && (
                    <button
                      onClick={e => { e.stopPropagation(); onClose(); router.push(`/dashboard/trips/${currentStory.id}`); }}
                      className="flex items-center gap-2 bg-indigo-500/80 backdrop-blur-md border border-indigo-400/30 text-white text-[12px] font-medium px-4 py-2.5 rounded-full hover:bg-indigo-500 active:scale-95 transition"
                    >
                      <Plane className="w-3.5 h-3.5" />
                      Ver viagem
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* ─── LAYER 7: Gesture capture overlay ─── */}
            <div
              className="absolute inset-0 z-20 cursor-pointer"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onMouseDown={onMouseDown}
              onMouseUp={onMouseUp}
              /* Desktop click zones */
              onClick={e => {
                const x = e.clientX;
                const w = (e.currentTarget as HTMLElement).getBoundingClientRect().width;
                if (x < w * 0.35) goBackFn(); else advanceFn();
              }}
            />

          </motion.div>
        </AnimatePresence>

        {/* ─── Pause indicator (hold to pause) ─── */}
        <AnimatePresence>
          {isPaused && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
            >
              <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/10">
                <div className="flex gap-[5px]">
                  <div className="w-[5px] h-7 rounded-full bg-white" />
                  <div className="w-[5px] h-7 rounded-full bg-white" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Story dots (bottom, desktop) ─── */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1.5 z-40 pointer-events-none">
          {stories.map((_, i) => (
            <div
              key={i}
              className={cn(
                'rounded-full transition-all duration-300',
                i === storyIdx ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/30'
              )}
            />
          ))}
        </div>

      </div>{/* /card */}

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
