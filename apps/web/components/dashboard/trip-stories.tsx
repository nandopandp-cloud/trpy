'use client';

import { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate as animateMotion } from 'framer-motion';
import {
  Plus, X, ChevronLeft, ChevronRight,
  ExternalLink, MapPin, Volume2, VolumeX, Plane, Heart,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

/* ── Mobile detection hook ─────────────────────────────── */

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return isMobile;
}

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
  { type: 'suggestion', title: 'Kyoto',           destination: 'Kyoto Japão',            subtitle: 'Japão',          emoji: '⛩️',  gradient: 'from-rose-600 to-pink-700' },
  { type: 'suggestion', title: 'Maldivas',        destination: 'Maldivas',                subtitle: 'Maldivas',       emoji: '🏝️',  gradient: 'from-cyan-500 to-blue-600' },
  { type: 'suggestion', title: 'Marrocos',        destination: 'Marrocos',                subtitle: 'Marrocos',       emoji: '🕌',  gradient: 'from-amber-600 to-orange-700' },
  { type: 'suggestion', title: 'Santorini',       destination: 'Santorini Grécia',        subtitle: 'Grécia',         emoji: '🏛️',  gradient: 'from-blue-500 to-cyan-600' },
  { type: 'suggestion', title: 'Bali',            destination: 'Bali Indonésia',          subtitle: 'Indonésia',      emoji: '🌺',  gradient: 'from-emerald-500 to-teal-600' },
  { type: 'suggestion', title: 'Patagônia',       destination: 'Patagônia Argentina',     subtitle: 'Argentina',      emoji: '🏔️',  gradient: 'from-slate-500 to-slate-700' },
  { type: 'suggestion', title: 'Lisboa',          destination: 'Lisboa Portugal',         subtitle: 'Portugal',       emoji: '🏡',  gradient: 'from-yellow-500 to-orange-600' },
  { type: 'suggestion', title: 'Nova York',       destination: 'Nova York EUA',           subtitle: 'EUA',            emoji: '🗽',  gradient: 'from-sky-600 to-blue-700' },
  { type: 'suggestion', title: 'Tóquio',          destination: 'Tóquio Japão',            subtitle: 'Japão',          emoji: '🎌',  gradient: 'from-red-500 to-rose-700' },
  { type: 'suggestion', title: 'Islândia',        destination: 'Islândia',                subtitle: 'Islândia',       emoji: '🌋',  gradient: 'from-indigo-600 to-violet-700' },
  { type: 'suggestion', title: 'Dubai',           destination: 'Dubai Emirados',          subtitle: 'Emirados',       emoji: '🏙️',  gradient: 'from-amber-400 to-yellow-600' },
  { type: 'suggestion', title: 'Tailândia',       destination: 'Bangkok Tailândia',       subtitle: 'Tailândia',      emoji: '🛕',  gradient: 'from-orange-500 to-red-600' },
  { type: 'suggestion', title: 'Costa Rica',      destination: 'Costa Rica',              subtitle: 'Costa Rica',     emoji: '🦜',  gradient: 'from-green-500 to-emerald-700' },
  { type: 'suggestion', title: 'Paris',           destination: 'Paris França',            subtitle: 'França',         emoji: '🗼',  gradient: 'from-pink-500 to-rose-600' },
  { type: 'suggestion', title: 'Machu Picchu',    destination: 'Machu Picchu Peru',       subtitle: 'Peru',           emoji: '🏯',  gradient: 'from-lime-600 to-green-700' },
  { type: 'suggestion', title: 'Safari Kenya',    destination: 'Safári Quênia',           subtitle: 'Quênia',         emoji: '🦁',  gradient: 'from-yellow-600 to-amber-700' },
  { type: 'suggestion', title: 'Barcelona',       destination: 'Barcelona Espanha',       subtitle: 'Espanha',        emoji: '🎨',  gradient: 'from-red-500 to-yellow-500' },
  { type: 'suggestion', title: 'Amsterdã',        destination: 'Amsterdã Holanda',        subtitle: 'Holanda',        emoji: '🌷',  gradient: 'from-violet-500 to-purple-700' },
  { type: 'suggestion', title: 'Vancouver',       destination: 'Vancouver Canadá',        subtitle: 'Canadá',         emoji: '🍁',  gradient: 'from-red-600 to-rose-700' },
  { type: 'suggestion', title: 'Amalfi',          destination: 'Costa Amalfi Itália',     subtitle: 'Itália',         emoji: '🍋',  gradient: 'from-yellow-400 to-orange-500' },
  { type: 'suggestion', title: 'Phuket',          destination: 'Phuket Tailândia',        subtitle: 'Tailândia',      emoji: '⛵',  gradient: 'from-teal-500 to-cyan-600' },
  { type: 'suggestion', title: 'Nepal',           destination: 'Katmandu Nepal',          subtitle: 'Nepal',          emoji: '🏔️',  gradient: 'from-orange-600 to-red-700' },
  { type: 'suggestion', title: 'Nova Zelândia',   destination: 'Nova Zelândia',           subtitle: 'Nova Zelândia',  emoji: '🐑',  gradient: 'from-green-600 to-teal-700' },
  { type: 'suggestion', title: 'Egipto',          destination: 'Cairo Egito',             subtitle: 'Egito',          emoji: '🐪',  gradient: 'from-amber-500 to-yellow-600' },
  { type: 'suggestion', title: 'Meksiko',         destination: 'Cidade do México',        subtitle: 'México',         emoji: '🌮',  gradient: 'from-green-500 to-red-600' },
  { type: 'suggestion', title: 'Seul',            destination: 'Seul Coreia do Sul',      subtitle: 'Coreia do Sul',  emoji: '🌸',  gradient: 'from-pink-500 to-fuchsia-600' },
  { type: 'suggestion', title: 'Rio de Janeiro',  destination: 'Rio de Janeiro Brasil',   subtitle: 'Brasil',         emoji: '🎭',  gradient: 'from-green-500 to-yellow-500' },
  { type: 'suggestion', title: 'Singapura',       destination: 'Singapura',               subtitle: 'Singapura',      emoji: '🌃',  gradient: 'from-purple-600 to-blue-700' },
  { type: 'suggestion', title: 'Veneza',          destination: 'Veneza Itália',           subtitle: 'Itália',         emoji: '🚤',  gradient: 'from-blue-500 to-indigo-600' },
  { type: 'suggestion', title: 'Estocolmo',       destination: 'Estocolmo Suécia',        subtitle: 'Suécia',         emoji: '🏰',  gradient: 'from-sky-500 to-blue-600' },
  { type: 'suggestion', title: 'Marrakech',       destination: 'Marrakech Marrocos',      subtitle: 'Marrocos',       emoji: '🎪',  gradient: 'from-orange-500 to-red-600' },
  { type: 'suggestion', title: 'Abu Dhabi',       destination: 'Abu Dhabi Emirados',      subtitle: 'Emirados',       emoji: '⛪',  gradient: 'from-amber-500 to-orange-600' },
  { type: 'suggestion', title: 'Banguecoque',     destination: 'Banguecoque Tailândia',   subtitle: 'Tailândia',      emoji: '🏮',  gradient: 'from-red-500 to-pink-600' },
  { type: 'suggestion', title: 'Praga',           destination: 'Praga República Tcheca',  subtitle: 'Rep. Tcheca',    emoji: '🏰',  gradient: 'from-red-600 to-rose-700' },
  { type: 'suggestion', title: 'Dubrovnik',       destination: 'Dubrovnik Croácia',       subtitle: 'Croácia',        emoji: '🏛️',  gradient: 'from-amber-600 to-orange-700' },
  { type: 'suggestion', title: 'Buenos Aires',    destination: 'Buenos Aires Argentina',  subtitle: 'Argentina',      emoji: '💃',  gradient: 'from-pink-600 to-fuchsia-700' },
  { type: 'suggestion', title: 'Mumbai',          destination: 'Mumbai Índia',            subtitle: 'Índia',          emoji: '🏙️',  gradient: 'from-orange-500 to-yellow-600' },
  { type: 'suggestion', title: 'Giza',            destination: 'Giza Egito',              subtitle: 'Egito',          emoji: '🔺',  gradient: 'from-yellow-600 to-amber-700' },
  { type: 'suggestion', title: 'Berna',           destination: 'Berna Suíça',             subtitle: 'Suíça',          emoji: '⛩️',  gradient: 'from-red-500 to-rose-600' },
  { type: 'suggestion', title: 'Havai',           destination: 'Honolulu Havai',          subtitle: 'Havai',          emoji: '🌴',  gradient: 'from-cyan-500 to-blue-600' },
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

/* ── Batch photo cache ────────────────────────────────── */
// Mapa global destination → url. Preenchido de uma vez no TripStories pai.
// Um contador de versão notifica os bubbles quando o cache é atualizado.

const photoCache = new Map<string, string>();
let cacheVersion = 0;
const cacheListeners = new Set<() => void>();

function notifyPhotoCache() {
  cacheVersion++;
  cacheListeners.forEach(fn => fn());
}

function useDestinationPhoto(destination: string, initial?: string | null): string | null {
  const [photo, setPhoto] = useState<string | null>(() => {
    if (initial) return initial;
    return photoCache.get(destination) ?? null;
  });

  // Escuta notificações do batch — quando o cache é populado, atualiza o estado.
  useEffect(() => {
    if (initial) return;
    const sync = () => {
      const cached = photoCache.get(destination);
      if (cached) setPhoto(cached);
    };
    sync(); // lê imediatamente (pode já estar no cache)
    cacheListeners.add(sync);
    return () => { cacheListeners.delete(sync); };
  }, [destination, initial]);

  // Fallback individual — caso o batch não cubra este destino.
  useEffect(() => {
    if (initial || photoCache.has(destination)) return;
    let cancelled = false;
    fetch(`/api/destination-photo?q=${encodeURIComponent(destination)}`)
      .then(r => r.json())
      .then(d => {
        if (cancelled) return;
        const url = d.success && d.data?.photoUrl ? (d.data.photoUrl as string) : null;
        if (url) { photoCache.set(destination, url); notifyPhotoCache(); }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [destination, initial]);

  return photo;
}

// Pré-carrega fotos de todos os destinos de uma vez via endpoint batch.
function usePhotoBatch(destinations: string[]) {
  const key = destinations.slice().sort().join('|');

  useEffect(() => {
    if (destinations.length === 0) return;
    const missing = destinations.filter(d => !photoCache.has(d));
    if (missing.length === 0) return;

    // Divide em lotes de 20 (limite do endpoint)
    const chunks: string[][] = [];
    for (let i = 0; i < missing.length; i += 20) {
      chunks.push(missing.slice(i, i + 20));
    }

    let cancelled = false;
    Promise.all(
      chunks.map(chunk =>
        fetch('/api/destination-photo/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destinations: chunk }),
        })
          .then(r => r.json())
          .then(d => {
            if (cancelled || !d.success) return;
            const map = d.data as Record<string, string | null>;
            Object.entries(map).forEach(([dest, url]) => {
              if (url) photoCache.set(dest, url);
            });
          })
          .catch(() => {}),
      ),
    ).then(() => { if (!cancelled) notifyPhotoCache(); });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
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
/* NEIGHBOR SLIDE — static cover used during mobile cube    */
/* ════════════════════════════════════════════════════════ */

function NeighborSlide({ story }: { story: StoryItem }) {
  const photo = useDestinationPhoto(story.destination, story.coverImage);
  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      {photo ? (
        <>
          <img
            src={photo}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40 pointer-events-none"
            aria-hidden
          />
          <img
            src={photo}
            alt={story.title}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        </>
      ) : (
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br',
            story.gradient ?? GRADIENT_FALLBACKS[0],
          )}
        />
      )}
      {/* Scrims to match the active story look */}
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      {/* Minimal header — mirrors active slide */}
      <div className="absolute top-10 inset-x-4 flex items-center gap-2.5 z-10 pointer-events-none">
        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/50 shrink-0">
          {photo ? (
            <img src={photo} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center text-base', story.gradient)}>
              {story.emoji}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-[15px] leading-none drop-shadow">{story.title}</p>
          {story.subtitle && (
            <p className="text-white/70 text-[11px] mt-0.5 flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 shrink-0" />
              {story.subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Favorite helper ──────────────────────────────────── */
// Toggle "VIDEO" favorite via API. Optimistic, idempotent — duplo-tap repetido
// alterna entre favorito/não favorito.

async function toggleVideoFavorite(video: YouTubeVideo, destination: string): Promise<'added' | 'removed' | 'error'> {
  try {
    const params = new URLSearchParams({ type: 'VIDEO', externalId: video.id });
    const checkRes = await fetch(`/api/favorites/check?${params}`);
    const checkData = await checkRes.json();
    const isFav = checkData.success ? checkData.data?.favorited : false;

    if (isFav) {
      await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'VIDEO', externalId: video.id }),
      });
      return 'removed';
    }

    await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'VIDEO',
        externalId: video.id,
        name: video.title,
        image: video.thumbnail,
        youtubeVideoId: video.id,
        metadata: { channelTitle: video.channelTitle, destination },
      }),
    });
    return 'added';
  } catch {
    return 'error';
  }
}

/* ════════════════════════════════════════════════════════ */
/* STORY VIEWER  — Instagram-grade experience              */
/* ════════════════════════════════════════════════════════ */

const STORY_DURATION = 50000; // ms per video segment
const DOUBLE_TAP_MS = 220;    // janela para detectar duplo-toque (mais snappy)
const HOLD_MS = 240;          // long-press para pause sustentado
const SPINNER_DELAY_MS = 850; // só mostra spinner se vídeo demorar mais que isso

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
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

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
  const mutedRef    = useRef(true);
  mutedRef.current  = muted;

  /* ── Heart feedback (duplo-tap → favoritar) ── */
  const [hearts, setHearts] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [favStatus, setFavStatus] = useState<'added' | 'removed' | null>(null);
  const heartIdRef = useRef(0);

  /* ── Iframe ref para postMessage de mute/play/pause ── */
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerReadyRef = useRef(false);   // true quando o YT iframe sinaliza onReady
  const [iframeFadeIn, setIframeFadeIn] = useState(false); // só fade in quando player ready

  /* ── Mobile cube-swipe drag state ── */
  const dragX = useMotionValue(0);              // live x offset during drag
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const frameWidthRef = useRef(0);               // card width (set on touchstart)
  const frameRef = useRef<HTMLDivElement>(null);
  const swipeAnimatingRef = useRef(false);       // true while commit/cancel spring is in flight

  /* ── Touch gesture ── */
  type TouchState = { x: number; y: number; time: number };
  const touchRef    = useRef<TouchState | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didSwipeRef  = useRef(false);
  const gestureModeRef = useRef<'idle' | 'hold' | 'hdrag' | 'vdrag'>('idle');

  /* Para distinguir single-tap (centro = pause) de double-tap (favoritar),
     guardamos a última posição/tempo de tap e um timer pendente para o
     single-tap. O timer é cancelado se um segundo tap chega dentro de DOUBLE_TAP_MS. */
  const lastTapRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const singleTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPressRef = useRef(false);

  // Limpa timers pendentes no unmount para evitar callbacks rodando após
  // o componente sair (causaria stale state e pause "fantasma").
  useEffect(() => {
    return () => {
      if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current);
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, []);

  /* ── Video data ── */
  const currentStory = stories[storyIdx];
  const coverPhoto   = useDestinationPhoto(currentStory.destination, currentStory.coverImage);
  const { videos, loading } = useStoryVideos(currentStory.destination);

  const currentVideo = videos[videoIdx] ?? null;
  const totalBars    = Math.max(videos.length, 1);

  /* Spinner com atraso — evita pisca em transições rápidas entre destinos.
     Só mostra spinner se loading durar mais que SPINNER_DELAY_MS. */
  const [showSpinner, setShowSpinner] = useState(false);
  useEffect(() => {
    if (!loading) { setShowSpinner(false); return; }
    const t = setTimeout(() => setShowSpinner(true), SPINNER_DELAY_MS);
    return () => clearTimeout(t);
  }, [loading]);

  /* ══════════════════ RAF PROGRESS ══════════════════════ */

  // Ref para advanceFn — permite que o tick do RAF sempre chame a versão
  // mais recente sem depender de closure, eliminando o bug de stale closure
  // que fazia o progresso travar após o primeiro vídeo.
  const advanceFnRef = useRef<() => void>(() => {});

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
      if (pct >= 100) { advanceFnRef.current(); return; }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [stopRaf]);

  /* ── YouTube iframe controls (postMessage API) ──────────────────────────
     Comandos enviados antes do `onReady` são descartados pelo YT player —
     por isso enfileiramos enquanto não está pronto e drenamos no listener. */
  const ytCommandQueueRef = useRef<Array<{ func: string; args: unknown[] }>>([]);

  const sendYTCommand = useCallback((command: string, args: unknown[] = []) => {
    const win = iframeRef.current?.contentWindow;
    if (!win || !playerReadyRef.current) {
      ytCommandQueueRef.current.push({ func: command, args });
      return;
    }
    win.postMessage(JSON.stringify({ event: 'command', func: command, args }), '*');
  }, []);

  const pauseRaf = useCallback(() => {
    isPausedRef.current = true;
    setIsPaused(true);
    sendYTCommand('pauseVideo');
  }, [sendYTCommand]);

  const resumeRaf = useCallback(() => {
    isPausedRef.current = false;
    setIsPaused(false);
    // Reset start so elapsed time resets (progress saved in savedPctRef)
    startTsRef.current = null;
    sendYTCommand('playVideo');
  }, [sendYTCommand]);

  /* Toggle mute via postMessage — não remonta o iframe, evita re-loading */
  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      sendYTCommand(next ? 'mute' : 'unMute');
      // setVolume reforça (alguns players ignoram unMute sem volume explícito)
      if (!next) sendYTCommand('setVolume', [100]);
      return next;
    });
  }, [sendYTCommand]);

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

  // Mantém a ref sempre atualizada para que o tick do RAF use a versão correta.
  advanceFnRef.current = advanceFn;

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
  // Single unified effect: reset progress on index change, start RAF only when not loading
  const prevIndicesRef = useRef({ storyIdx, videoIdx });
  useEffect(() => {
    const indicesChanged =
      prevIndicesRef.current.storyIdx !== storyIdx ||
      prevIndicesRef.current.videoIdx !== videoIdx;
    prevIndicesRef.current = { storyIdx, videoIdx };

    if (indicesChanged) {
      isPausedRef.current = false;
      setIsPaused(false);
      savedPctRef.current = 0;
      setProgress(0);
    }

    if (!loading) {
      savedPctRef.current = 0;
      startRaf();
    }
    return stopRaf;
  }, [storyIdx, videoIdx, loading, startRaf, stopRaf]);

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

  /* ── YouTube postMessage listener — handshake real ──────────────────────
     Quando o iframe carrega, envia `listening` para começar a receber eventos.
     Quando recebe `onReady` (info.playerState != null), drena a fila de comandos
     pendentes — isso garante que mute/unMute/setVolume cheguem no momento certo,
     eliminando o problema de "áudio não sai". */
  useEffect(() => {
    function handleMessage(ev: MessageEvent) {
      // Mensagens vêm do origin do YouTube nocookie
      if (typeof ev.data !== 'string') return;
      if (!/youtube/.test(ev.origin)) return;
      let payload: any;
      try { payload = JSON.parse(ev.data); } catch { return; }
      if (!payload || payload.id == null) return;

      // `onReady` chega com event="onReady" ou com info contendo playerState inicial
      if (payload.event === 'onReady' || payload.event === 'initialDelivery') {
        playerReadyRef.current = true;
        const win = iframeRef.current?.contentWindow;
        if (win) {
          // 1) Drena fila ANTES de qualquer comando deste handler — assim
          //    pauseVideo enfileirado durante a transição não é sobrescrito
          //    pelo playVideo abaixo.
          const queue = ytCommandQueueRef.current;
          ytCommandQueueRef.current = [];
          for (const cmd of queue) {
            win.postMessage(JSON.stringify({ event: 'command', func: cmd.func, args: cmd.args }), '*');
          }
          // 2) Aplica mute/volume conforme estado atual
          if (mutedRef.current) {
            win.postMessage(JSON.stringify({ event: 'command', func: 'mute', args: [] }), '*');
          } else {
            win.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: [] }), '*');
            win.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [100] }), '*');
          }
          // 3) Sincroniza play/pause com o estado atual (NÃO força play —
          //    se o usuário pausou durante a transição, respeita).
          win.postMessage(
            JSON.stringify({
              event: 'command',
              func: isPausedRef.current ? 'pauseVideo' : 'playVideo',
              args: [],
            }),
            '*',
          );
        }
        // Mostra o iframe (fade in) só agora que sabemos que está pronto
        setIframeFadeIn(true);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  /* Quando o videoId muda, reseta o flag de ready, esconde o iframe (cobertura
     pelo blurred cover), e dispara handshake `listening` assim que o iframe
     monta. */
  useEffect(() => {
    if (!currentVideo) return;
    playerReadyRef.current = false;
    setIframeFadeIn(false);
    ytCommandQueueRef.current = [];

    // Aguarda o próximo frame para garantir que o iframe foi montado
    const raf = requestAnimationFrame(() => {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;
      // Handshake oficial — sem isso o YT não envia eventos de volta
      win.postMessage(JSON.stringify({ event: 'listening' }), '*');
    });
    return () => cancelAnimationFrame(raf);
  }, [currentVideo?.id]);

  /* ══════════════════ TOUCH / GESTURE ══════════════════ */

  /* Commit a cube-swipe: animate dragX to its end position, then swap storyIdx */
  const commitCubeSwipe = useCallback((direction: 1 | -1) => {
    if (swipeAnimatingRef.current) return;
    swipeAnimatingRef.current = true;
    const width = frameWidthRef.current || window.innerWidth;
    const target = direction === 1 ? -width : width;
    animateMotion(dragX, target, {
      type: 'spring',
      stiffness: 320,
      damping: 36,
      mass: 0.9,
      onComplete: () => {
        // Swap story, reset drag invisibly
        directionRef.current = direction;
        savedPctRef.current = 0;
        if (direction === 1) {
          setStoryIdx((i) => Math.min(storiesRef.current.length - 1, i + 1));
        } else {
          setStoryIdx((i) => Math.max(0, i - 1));
        }
        setVideoIdx(0);
        dragX.set(0);
        setIsDragging(false);
        isDraggingRef.current = false;
        gestureModeRef.current = 'idle';
        swipeAnimatingRef.current = false;
      },
    });
  }, [dragX]);

  /* Rubber-band back to current story */
  const cancelCubeSwipe = useCallback(() => {
    if (swipeAnimatingRef.current) return;
    swipeAnimatingRef.current = true;
    animateMotion(dragX, 0, {
      type: 'spring',
      stiffness: 420,
      damping: 42,
      mass: 0.7,
      onComplete: () => {
        setIsDragging(false);
        isDraggingRef.current = false;
        gestureModeRef.current = 'idle';
        swipeAnimatingRef.current = false;
        // Resume progress since we paused on drag start
        if (isPausedRef.current) resumeRaf();
      },
    });
  }, [dragX, resumeRaf]);

  /* ── Triggers de tap resolvidos depois do double-tap window ── */

  const togglePause = useCallback(() => {
    if (isPausedRef.current) resumeRaf();
    else pauseRaf();
  }, [pauseRaf, resumeRaf]);

  /* Mostra um heart animado na posição (x, y) relativa ao frame */
  const showHeart = useCallback((x: number, y: number) => {
    const id = ++heartIdRef.current;
    setHearts((arr) => [...arr, { id, x, y }]);
    setTimeout(() => {
      setHearts((arr) => arr.filter((h) => h.id !== id));
    }, 900);
  }, []);

  const triggerFavorite = useCallback(async (x: number, y: number) => {
    showHeart(x, y);
    if (!currentVideo) return;
    const result = await toggleVideoFavorite(currentVideo, currentStory.destination);
    if (result === 'added' || result === 'removed') {
      setFavStatus(result);
      setTimeout(() => setFavStatus(null), 1400);
      // Invalida queries de favoritos pra atualizar a UI da página
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorites-stats'] });
      queryClient.invalidateQueries({ queryKey: ['favorite-check', 'VIDEO', currentVideo.id] });
    }
  }, [currentVideo, currentStory.destination, queryClient, showHeart]);

  /* Resolve um tap simples — chamado depois da janela DOUBLE_TAP_MS expirar
     (sem segundo tap detectado). Aplica zona 30/40/30: esquerda volta,
     centro pausa/despausa, direita avança. */
  const resolveSingleTap = useCallback((relativeX: number, frameWidth: number) => {
    const leftZone  = frameWidth * 0.30;
    const rightZone = frameWidth * 0.70;
    if (relativeX < leftZone) {
      goBackFn();
    } else if (relativeX > rightZone) {
      advanceFn();
    } else {
      togglePause();
    }
  }, [goBackFn, advanceFn, togglePause]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    // Block new gestures while a swipe animation is in flight
    if (swipeAnimatingRef.current) return;
    didSwipeRef.current = false;
    didLongPressRef.current = false;
    gestureModeRef.current = 'idle';
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() };

    // Cache frame width for drag math
    if (frameRef.current) {
      frameWidthRef.current = frameRef.current.getBoundingClientRect().width;
    }

    // Long-press → pause sustentado (Instagram-style hold to inspect).
    // Marca didLongPressRef para que onTouchEnd não confunda com tap simples.
    holdTimerRef.current = setTimeout(() => {
      if (gestureModeRef.current === 'idle') {
        gestureModeRef.current = 'hold';
        didLongPressRef.current = true;
        pauseRaf();
      }
    }, HOLD_MS);
  }, [pauseRaf]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current) return;
    const cx = e.touches[0].clientX;
    const cy = e.touches[0].clientY;
    const dx = cx - touchRef.current.x;
    const dy = cy - touchRef.current.y;
    const adx = Math.abs(dx);
    const ady = Math.abs(dy);

    // Cancel hold-to-pause if finger moves
    if ((adx > 6 || ady > 6) && holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (adx > 8 || ady > 8) didSwipeRef.current = true;

    // Once we're in hdrag mode, keep tracking even if movement gets vertical
    if (gestureModeRef.current === 'hdrag') {
      let next = dx;
      // Rubber-band at edges
      const atStart = storyIdxRef.current === 0;
      const atEnd = storyIdxRef.current === storiesRef.current.length - 1;
      if ((atStart && dx > 0) || (atEnd && dx < 0)) {
        next = dx * 0.3;
      }
      dragX.set(next);
      e.stopPropagation();
      return;
    }

    // On mobile, decide gesture mode early once movement is significant
    if (isMobile && gestureModeRef.current === 'idle' && (adx > 10 || ady > 10)) {
      if (adx > ady * 1.1) {
        // Horizontal swipe begins — enter cube drag mode
        gestureModeRef.current = 'hdrag';
        isDraggingRef.current = true;
        setIsDragging(true);
        pauseRaf();
        let next = dx;
        const atStart = storyIdxRef.current === 0;
        const atEnd = storyIdxRef.current === storiesRef.current.length - 1;
        if ((atStart && dx > 0) || (atEnd && dx < 0)) {
          next = dx * 0.3;
        }
        dragX.set(next);
      } else {
        // Vertical — let default flow handle swipe-down-to-close
        gestureModeRef.current = 'vdrag';
      }
    }
  }, [dragX, isMobile, pauseRaf]);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    // Resolve cube swipe
    if (gestureModeRef.current === 'hdrag' && touchRef.current) {
      const dx = e.changedTouches[0].clientX - touchRef.current.x;
      const dt = Date.now() - touchRef.current.time;
      const velocity = Math.abs(dx) / Math.max(dt, 1); // px/ms
      const width = frameWidthRef.current || window.innerWidth;
      const threshold = width * 0.22;
      const fast = velocity > 0.45;
      const atStart = storyIdxRef.current === 0;
      const atEnd = storyIdxRef.current === storiesRef.current.length - 1;

      touchRef.current = null;

      if (dx < 0 && (Math.abs(dx) > threshold || fast) && !atEnd) {
        commitCubeSwipe(1);
      } else if (dx > 0 && (Math.abs(dx) > threshold || fast) && !atStart) {
        commitCubeSwipe(-1);
      } else {
        cancelCubeSwipe();
      }
      return;
    }

    // Long-press soltou: retomar reprodução
    if (gestureModeRef.current === 'hold') {
      gestureModeRef.current = 'idle';
      resumeRaf();
      touchRef.current = null;
      return;
    }

    if (!touchRef.current) return;
    const startTouch = touchRef.current;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - startTouch.x;
    const dy = endY - startTouch.y;
    touchRef.current = null;

    // Swipe down → close (vdrag mode)
    if (dy > 100 && Math.abs(dy) > Math.abs(dx) * 1.5) {
      onClose();
      gestureModeRef.current = 'idle';
      return;
    }

    // Se foi um swipe (movimento maior que 8px), não processa como tap
    if (didSwipeRef.current || didLongPressRef.current) {
      gestureModeRef.current = 'idle';
      return;
    }

    // ─── Tap genuíno: resolver single vs double ────────────────────────────
    const rect = frameRef.current?.getBoundingClientRect();
    const leftEdge = rect?.left ?? 0;
    const topEdge  = rect?.top  ?? 0;
    const width    = rect?.width ?? window.innerWidth;
    const relativeX = endX - leftEdge;
    const relativeY = endY - topEdge;
    const now = Date.now();

    const last = lastTapRef.current;
    const isDoubleTap =
      last !== null &&
      now - last.t <= DOUBLE_TAP_MS &&
      Math.abs(endX - last.x) < 40 &&
      Math.abs(endY - last.y) < 40;

    if (isDoubleTap) {
      // Cancela o single-tap pendente para não disparar zona depois
      if (singleTapTimerRef.current) {
        clearTimeout(singleTapTimerRef.current);
        singleTapTimerRef.current = null;
      }
      lastTapRef.current = null;
      triggerFavorite(relativeX, relativeY);
      gestureModeRef.current = 'idle';
      return;
    }

    // Primeiro tap — agenda single-tap. Se um segundo tap chegar dentro de
    // DOUBLE_TAP_MS, este timer é cancelado pelo branch acima.
    lastTapRef.current = { x: endX, y: endY, t: now };
    if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current);
    singleTapTimerRef.current = setTimeout(() => {
      singleTapTimerRef.current = null;
      lastTapRef.current = null;
      resolveSingleTap(relativeX, width);
    }, DOUBLE_TAP_MS);

    gestureModeRef.current = 'idle';
  }, [cancelCubeSwipe, commitCubeSwipe, onClose, resumeRaf, resolveSingleTap, triggerFavorite]);

  /* No desktop, NÃO usamos hold-to-pause via mouse. O long-press no desktop
     conflita com onClick (synthetic click ainda dispara depois do mousedown
     via timer), e gera uma race com o singleTapTimer. Pausa no desktop é via
     clique central + tecla espaço. Hold-to-pause permanece exclusivo do touch. */

  /* ══════════════════ CUBE TRANSFORMS (mobile) ═════════ */

  // dragX goes from -width (swiped left, advance) to +width (swiped right, back)
  // For current slide: rotate around the edge that stays (right edge when swiping left, left edge when swiping right)
  // For neighbor slide: rotate in from the opposite edge
  const MAX_ANGLE = 80;

  const currentRotateY = useTransform(dragX, (x) => {
    const width = frameWidthRef.current || 1;
    const pct = Math.max(-1, Math.min(1, x / width));
    return -pct * MAX_ANGLE;
  });

  const currentOpacity = useTransform(dragX, (x) => {
    const width = frameWidthRef.current || 1;
    const pct = Math.abs(x) / width;
    return 1 - pct * 0.35;
  });

  const nextRotateY = useTransform(dragX, (x) => {
    const width = frameWidthRef.current || 1;
    const pct = Math.max(-1, Math.min(0, x / width)); // only when dragging left (x negative)
    return MAX_ANGLE + pct * MAX_ANGLE; // 80 → 0
  });

  const nextTranslateX = useTransform(dragX, (x) => {
    const width = frameWidthRef.current || 1;
    // sits one width to the right, follows drag
    return width + x;
  });

  const prevRotateY = useTransform(dragX, (x) => {
    const width = frameWidthRef.current || 1;
    const pct = Math.max(0, Math.min(1, x / width));
    return -MAX_ANGLE + pct * MAX_ANGLE; // -80 → 0
  });

  const prevTranslateX = useTransform(dragX, (x) => {
    const width = frameWidthRef.current || 1;
    return -width + x;
  });

  const currentTransformOrigin = useTransform(dragX, (x) =>
    x < 0 ? 'left center' : 'right center'
  );

  const prevStory = storyIdx > 0 ? stories[storyIdx - 1] : null;
  const nextStory = storyIdx < stories.length - 1 ? stories[storyIdx + 1] : null;

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
      <div
        ref={frameRef}
        className="relative w-full h-full md:w-[420px] md:h-[calc(100dvh-32px)] md:max-h-[780px] md:rounded-[2rem] overflow-hidden md:shadow-2xl"
        style={{ perspective: '1200px', transformStyle: 'preserve-3d' }}
      >

        {/* ── Cube neighbor slides (mobile drag only) ── */}
        {isMobile && isDragging && prevStory && (
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              x: prevTranslateX,
              rotateY: prevRotateY,
              transformOrigin: 'right center',
              backfaceVisibility: 'hidden',
              zIndex: 5,
            }}
          >
            <NeighborSlide story={prevStory} />
          </motion.div>
        )}
        {isMobile && isDragging && nextStory && (
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              x: nextTranslateX,
              rotateY: nextRotateY,
              transformOrigin: 'left center',
              backfaceVisibility: 'hidden',
              zIndex: 5,
            }}
          >
            <NeighborSlide story={nextStory} />
          </motion.div>
        )}

        {/* ── Animated story transition ── */}
        <AnimatePresence custom={directionRef.current} mode="sync">
          <motion.div
            key={`${storyIdx}-${videoIdx}`}
            custom={directionRef.current}
            variants={isMobile && isDragging ? undefined : slideVariants}
            initial={isMobile && isDragging ? false : 'enter'}
            animate={isMobile && isDragging ? undefined : 'center'}
            exit={isMobile && isDragging ? undefined : 'exit'}
            transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute inset-0"
            style={
              isMobile && isDragging
                ? {
                    x: dragX,
                    rotateY: currentRotateY,
                    opacity: currentOpacity,
                    transformOrigin: currentTransformOrigin,
                    backfaceVisibility: 'hidden',
                  }
                : undefined
            }
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

            {/* ─── LAYER 2: YouTube iframe (fills frame, cover crop) ───
                Iframe key = videoId apenas. Mute/play via postMessage
                (handshake onReady garante entrega). O fade in é controlado
                pelo state `iframeFadeIn` que vira true só quando o player
                sinaliza onReady — assim a transição não mostra "buffer screen"
                amarelo/preto do YouTube.
                Cobertura visual durante carregamento: o blurred coverPhoto
                da LAYER 1 fica visível atrás. Sem spinner piscando. */}
            {currentVideo && (
              <iframe
                ref={iframeRef}
                key={currentVideo.id}
                src={`https://www.youtube-nocookie.com/embed/${currentVideo.id}?autoplay=1&mute=1&controls=0&rel=0&playsinline=1&modestbranding=1&loop=0&enablejsapi=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  height: '100%',
                  aspectRatio: '16/9',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                  border: 0,
                  opacity: iframeFadeIn ? 1 : 0,
                  transition: 'opacity 280ms ease-out',
                }}
              />
            )}

            {/* Cover photo cobre o iframe enquanto não está ready — evita
                ver flash preto/buffer do YouTube na transição entre vídeos */}
            {currentVideo && !iframeFadeIn && coverPhoto && (
              <img
                src={coverPhoto}
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            )}

            {/* Loading state — só aparece se demorar (>850ms). Evita pisca
                rápido em transições normais entre destinos. */}
            {showSpinner && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10 pointer-events-none">
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
                  onClick={e => { e.stopPropagation(); toggleMute(); }}
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
              className="absolute inset-0 z-20 cursor-pointer select-none"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              /* Desktop double-click → favoritar */
              onDoubleClick={e => {
                if (isMobile) return;
                if (singleTapTimerRef.current) {
                  clearTimeout(singleTapTimerRef.current);
                  singleTapTimerRef.current = null;
                }
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                triggerFavorite(e.clientX - rect.left, e.clientY - rect.top);
              }}
              /* Desktop single-click — usa zona 30/40/30, com delay para
                 não disparar antes de um possível duplo-clique chegar. */
              onClick={e => {
                // Touch devices: onTouchEnd já resolve. Bloqueia o synthetic click.
                if (isMobile) return;
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                const relativeX = e.clientX - rect.left;
                const w = rect.width;
                if (singleTapTimerRef.current) clearTimeout(singleTapTimerRef.current);
                singleTapTimerRef.current = setTimeout(() => {
                  singleTapTimerRef.current = null;
                  resolveSingleTap(relativeX, w);
                }, DOUBLE_TAP_MS);
              }}
            />

          </motion.div>
        </AnimatePresence>

        {/* ─── Pause indicator ─── */}
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

        {/* ─── Heart pop animation (duplo-tap → favoritar) ─── */}
        <AnimatePresence>
          {hearts.map((h) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, scale: 0.4, x: h.x - 48, y: h.y - 48 }}
              animate={{ opacity: 1, scale: 1, x: h.x - 48, y: h.y - 48 }}
              exit={{ opacity: 0, scale: 1.4, y: h.y - 90 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-0 left-0 z-50 pointer-events-none"
              style={{ filter: 'drop-shadow(0 4px 16px rgba(244, 63, 94, 0.55))' }}
            >
              <Heart className="w-24 h-24 fill-rose-500 text-rose-500" strokeWidth={1.5} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ─── Toast de favorito ─── */}
        <AnimatePresence>
          {favStatus && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="absolute bottom-32 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
            >
              <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 text-sm font-medium text-white">
                <Heart className={cn('w-4 h-4', favStatus === 'added' ? 'fill-rose-500 text-rose-500' : 'text-white/70')} />
                {favStatus === 'added' ? 'Adicionado aos favoritos' : 'Removido dos favoritos'}
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
      className="relative w-[72px] h-[72px]"
    >
      {/* Gradient ring — fully circular */}
      <div
        className={cn(
          'absolute inset-0 rounded-full bg-gradient-to-br transition-opacity duration-300',
          ring,
          viewed ? 'opacity-25' : 'opacity-100'
        )}
        style={{ padding: '2.5px' }}
      >
        {/* Gap (bg color) */}
        <div className="w-full h-full rounded-full bg-background" style={{ padding: '2px' }}>
          {/* Cover image or gradient */}
          <div className="w-full h-full rounded-full overflow-hidden relative">
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
              <div className="absolute bottom-1 right-1">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-background" />
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Glow on hover */}
      <div
        className={cn(
          'absolute inset-0 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500 -z-10',
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

  // 16 destinos aleatórios renovados a cada 12h
  const suggestions = useSuggestions(16);

  // Pré-carrega fotos de todos os destinos (trips + suggestions) de uma vez.
  const allDestinations = [
    ...trips.map(t => t.destination),
    ...suggestions.map(s => s.destination),
  ].filter(Boolean);
  usePhotoBatch(allDestinations);

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

  function openStory(story: StoryItem) {
    setViewedIds(prev => new Set(prev).add(story.id));
    const idx = viewableStories.findIndex(s => s.id === story.id);
    setActiveIdx(idx >= 0 ? idx : 0);
    setViewerOpen(true);
  }

  return (
    <>
      {/* ── Section header ── */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
          <p className="text-sm font-semibold text-foreground">Descubra novos destinos</p>
        </div>
        <span className="text-[11px] text-muted-foreground font-medium">{viewableStories.length} lugares</span>
      </div>

      {/* ── Bubble strip ── */}
      <div className="relative -mx-4 md:-mx-6">
        {/* Fade masks */}
        <div className="absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 pt-1 px-4 md:px-6 snap-x snap-mandatory scroll-smooth">
          {viewableStories.map((story, i) => (
            <motion.button
              key={story.id}
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="snap-start shrink-0 flex flex-col items-center gap-2 group"
              onClick={() => openStory(story)}
            >
              <StoryBubble story={story} viewed={viewedIds.has(story.id)} />
              <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate max-w-[72px] text-center leading-tight">
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
