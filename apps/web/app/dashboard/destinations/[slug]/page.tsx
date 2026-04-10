'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  ArrowLeft, MapPin, Plus, Heart, Share2, Star,
  Globe, Calendar, Coins, Languages, Compass,
  Utensils, Hotel, Landmark, Youtube, Map,
  ChevronRight, Clock, Building2,
  ImageIcon,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { FavoriteButton } from '@/components/favorites/favorite-button';
import { GoogleMapView } from '@/components/integrations/google/google-map-view';
import { YouTubeVideoPlayer } from '@/components/integrations/youtube/youtube-video-player';
import { PlaceDetailModal } from '@/components/integrations/google/place-detail-modal';
import type { YouTubeVideo } from '@/lib/integrations/youtube/youtube-service';
import type { PlaceSearchResult } from '@/lib/integrations/google/places-service';
import { cn } from '@/lib/utils';

/* ── Constants ───────────────────────────────────────── */

const GRADIENTS = [
  'from-emerald-700 via-teal-700 to-cyan-800',
  'from-violet-700 via-purple-700 to-indigo-800',
  'from-rose-700 via-pink-700 to-fuchsia-800',
  'from-amber-700 via-orange-600 to-red-700',
  'from-blue-700 via-indigo-700 to-violet-800',
];

/* Destination metadata — enriches the overview section */
const DEST_META: Record<string, { desc: string; highlights: string[]; bestTime: string; currency: string; language: string }> = {
  bali:       { desc: 'Ilha dos deuses, famosa por praias paradisíacas, templos hindus milenares e uma gastronomia rica em sabores tropicais.', highlights: ['Praias', 'Templos', 'Surf', 'Yoga', 'Arrozais'], bestTime: 'Abr–Out', currency: 'IDR (Rupia)', language: 'Indonésio' },
  paris:      { desc: 'A Cidade Luz encanta com museus icônicos, gastronomia de classe mundial e a Torre Eiffel iluminando as noites.', highlights: ['Museus', 'Gastronomia', 'Moda', 'Romance', 'Arte'], bestTime: 'Abr–Jun', currency: 'EUR (Euro)', language: 'Francês' },
  'patagônia':{ desc: 'Paisagens dramáticas de geleiras, montanhas e lagos cristalinos no extremo sul da América do Sul.', highlights: ['Trekking', 'Geleiras', 'Natureza', 'Vida selvagem', 'Lagos'], bestTime: 'Nov–Mar', currency: 'ARS (Peso)', language: 'Espanhol' },
  tóquio:     { desc: 'Metrópole vibrante onde a tradição milenar encontra a tecnologia de ponta, templos ao lado de arranha-céus.', highlights: ['Tecnologia', 'Templos', 'Sushi', 'Anime', 'Cerejeiras'], bestTime: 'Mar–Mai', currency: 'JPY (Iene)', language: 'Japonês' },
  santorini:  { desc: 'Pôr do sol mais famoso do mundo, casas brancas com cúpulas azuis e águas cristalinas no Mar Egeu.', highlights: ['Pôr do sol', 'Vinícolas', 'Praias vulcânicas', 'Romance', 'Arquitetura'], bestTime: 'Jun–Set', currency: 'EUR (Euro)', language: 'Grego' },
  kyoto:      { desc: 'Antiga capital imperial do Japão, com milhares de templos, jardins zen e gueixas preservando tradições centenárias.', highlights: ['Templos', 'Jardins', 'Gueixas', 'Cerimônia do chá', 'Bambu'], bestTime: 'Mar–Mai', currency: 'JPY (Iene)', language: 'Japonês' },
  maldivas:   { desc: 'Paraíso tropical com águas turquesas, resorts sobre palafitas e recifes de coral que tiram o fôlego.', highlights: ['Snorkeling', 'Resorts', 'Praias', 'Mergulho', 'Romance'], bestTime: 'Nov–Abr', currency: 'MVR (Rufiyaa)', language: 'Divehi' },
  lisboa:     { desc: 'Capital portuguesa charmosa com ruas de paralelepípedo, pastéis de nata, fado e mirantes deslumbrantes.', highlights: ['Fado', 'Gastronomia', 'Mirantes', 'Pastéis', 'Alfama'], bestTime: 'Mar–Out', currency: 'EUR (Euro)', language: 'Português' },
  'rio de janeiro': { desc: 'Cidade maravilhosa com montanhas selvagens, praias icônicas e uma energia contagiante o ano todo.', highlights: ['Praia', 'Montanhas', 'Carnaval', 'Pão de Açúcar', 'Samba'], bestTime: 'Dez–Mar', currency: 'BRL (Real)', language: 'Português' },
  'nova york': { desc: 'A metrópole que nunca dorme, com edifícios imponentes, museus e uma cena gastronômica de classe mundial.', highlights: ['Arranha-céus', 'Museus', 'Broadway', 'Central Park', 'Gastronomia'], bestTime: 'Abr–Jun', currency: 'USD (Dólar)', language: 'Inglês' },
  'barcelona': { desc: 'Cidade catalã vibrante com arquitetura única, praias mediterrâneas e uma culinária que conquista paladares.', highlights: ['Arquitetura', 'Praias', 'Gastronomia', 'Arte', 'Cultura'], bestTime: 'Abr–Jun', currency: 'EUR (Euro)', language: 'Catalão/Espanhol' },
  'amsterdã': { desc: 'Capital dos Países Baixos com canais pitorescos, museus famosos e uma atmosfera cosmopolita e descontraída.', highlights: ['Canais', 'Museus', 'Bicicletas', 'Tulipas', 'Arquitetura'], bestTime: 'Abr–Set', currency: 'EUR (Euro)', language: 'Holandês' },
  'bangkok': { desc: 'Metrópole tailandesa fervilhante com templos dourados, mercados flutuantes e gastronomia picante e saborosa.', highlights: ['Templos', 'Mercados', 'Gastronomia', 'Compras', 'Vida noturna'], bestTime: 'Nov–Fev', currency: 'THB (Bath)', language: 'Tailandês' },
  'marrocos': { desc: 'País mágico com desertos fascinantes, medinas coloridas e uma cultura rica em tradições milenares.', highlights: ['Deserto', 'Medinas', 'Montanhas', 'Marroquinaria', 'Gastronomia'], bestTime: 'Set–Abr', currency: 'MAD (Dirã)', language: 'Árabe/Francês' },
  'vancouver': { desc: 'Cidade canadense aninhada entre montanhas e oceano, com natureza selvagem e uma cena urbana sofisticada.', highlights: ['Natureza', 'Montanhas', 'Praias', 'Parques', 'Gastronomia'], bestTime: 'Jun–Set', currency: 'CAD (Dólar Canadense)', language: 'Inglês' },
};

const DEFAULT_META = { desc: 'Descubra o melhor que este destino tem a oferecer — restaurantes, hotéis, atrações e experiências imperdíveis.', highlights: ['Cultura', 'Gastronomia', 'Natureza', 'Aventura'], bestTime: 'Consulte', currency: 'Consulte', language: 'Consulte' };

type TabKey = 'overview' | 'places' | 'videos' | 'map';

const NAV_TABS: { key: TabKey; label: string; icon: typeof Compass }[] = [
  { key: 'overview', label: 'Visão geral', icon: Compass },
  { key: 'places',   label: 'Lugares',     icon: Landmark },
  { key: 'videos',   label: 'Vídeos',      icon: Youtube },
  { key: 'map',      label: 'Mapa',        icon: Map },
];

type PlaceTab = 'restaurants' | 'hotels' | 'attractions';

const PLACE_TABS: { key: PlaceTab; label: string; icon: typeof Utensils; favoriteType: 'RESTAURANT' | 'HOTEL' | 'ACTIVITY' }[] = [
  { key: 'restaurants', label: 'Restaurantes', icon: Utensils, favoriteType: 'RESTAURANT' },
  { key: 'hotels',      label: 'Hotéis',       icon: Hotel,    favoriteType: 'HOTEL' },
  { key: 'attractions', label: 'Atrações',     icon: Landmark, favoriteType: 'ACTIVITY' },
];

const PRICE_LABEL = ['', '$', '$$', '$$$', '$$$$'];

/* ── Skeleton Components ─────────────────────────────── */

function HeroSkeleton() {
  return (
    <div className="relative h-[340px] md:h-[420px] animate-pulse bg-muted">
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 space-y-3">
        <div className="h-4 w-24 bg-muted-foreground/10 rounded-full" />
        <div className="h-8 w-56 bg-muted-foreground/10 rounded-lg" />
        <div className="h-4 w-40 bg-muted-foreground/10 rounded-full" />
      </div>
    </div>
  );
}

function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3 p-3 rounded-2xl border border-border animate-pulse">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-muted shrink-0" />
          <div className="flex-1 space-y-2 pt-1">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
            <div className="h-3 bg-muted rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function VideoSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="aspect-video rounded-2xl bg-muted animate-pulse" />
      ))}
    </div>
  );
}

/* ── Star Rating ─────────────────────────────────────── */

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="w-3.5 h-3.5"
          fill={i <= Math.round(value) ? 'currentColor' : 'none'}
          strokeWidth={1.5}
          style={{ color: i <= Math.round(value) ? '#F59E0B' : '#9CA3AF' }}
        />
      ))}
    </div>
  );
}

/* ── Place Card (Native Modal) ───────────────────────── */

function PlaceCard({ place, favoriteType, onOpen }: {
  place: PlaceSearchResult;
  favoriteType: 'RESTAURANT' | 'HOTEL' | 'ACTIVITY';
  onOpen: () => void;
}) {
  const photo = place.photos?.[0];
  const photoUrl = photo ? `/api/place-photo?ref=${photo.photo_reference}&maxwidth=400` : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onOpen}
      className="group flex gap-3 p-3 rounded-2xl bg-card border border-border hover:border-primary/40 hover:bg-muted/40 transition-all duration-200 cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shrink-0 bg-muted relative">
        {photoUrl ? (
          <img src={photoUrl} alt={place.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Building2 className="w-6 h-6 text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">{place.name}</p>
          <div onClick={(e) => e.stopPropagation()}>
            <FavoriteButton
              type={favoriteType}
              externalId={place.place_id}
              name={place.name}
              image={photoUrl ?? undefined}
              rating={place.rating}
              metadata={{ googlePlaceId: place.place_id, address: place.formatted_address }}
              size="sm"
              className="shrink-0 -mt-0.5"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {place.rating != null && (
            <div className="flex items-center gap-1">
              <StarRating value={place.rating} />
              <span className="text-xs text-muted-foreground">
                {place.rating.toFixed(1)}
                {place.user_ratings_total != null && <span className="ml-0.5 opacity-60">({place.user_ratings_total.toLocaleString('pt-BR')})</span>}
              </span>
            </div>
          )}
          {place.price_level != null && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{PRICE_LABEL[place.price_level]}</span>
          )}
          {place.opening_hours?.open_now != null && (
            <span className={cn('text-xs font-medium flex items-center gap-1', place.opening_hours.open_now ? 'text-emerald-500' : 'text-red-400')}>
              <Clock className="w-3 h-3" />
              {place.opening_hours.open_now ? 'Aberto' : 'Fechado'}
            </span>
          )}
        </div>

        {place.formatted_address && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0 opacity-50" />
            {place.formatted_address}
          </p>
        )}

        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary mt-2 group-hover:gap-1.5 transition-all">
          Ver detalhes <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </motion.div>
  );
}

/* ── Empty State ─────────────────────────────────────── */

function EmptyState({ icon: Icon, title, subtitle }: { icon: typeof Compass; title: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-3 py-16 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-muted/80 flex items-center justify-center">
        <Icon className="w-7 h-7 text-muted-foreground/50" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs">{subtitle}</p>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════ */
/* PAGE                                                  */
/* ══════════════════════════════════════════════════════ */

export default function DestinationDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const destination = decodeURIComponent(params.slug).replace(/-/g, ' ');
  const destKey = destination.toLowerCase();
  const meta = DEST_META[destKey] ?? DEFAULT_META;
  const gradient = GRADIENTS[destination.charCodeAt(0) % GRADIENTS.length];

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [placeTab, setPlaceTab] = useState<PlaceTab>('restaurants');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<{
    placeId: string;
    name: string;
    favoriteType: 'RESTAURANT' | 'HOTEL' | 'ACTIVITY';
  } | null>(null);

  /* Hero parallax */
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, 120]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  /* Sticky nav detection */
  const navRef = useRef<HTMLDivElement>(null);
  const [navStuck, setNavStuck] = useState(false);
  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => setNavStuck(!e.isIntersecting), { threshold: [1], rootMargin: '-1px 0px 0px 0px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* Cover image */
  useEffect(() => {
    if (!destination) return;
    setCoverImage(null); // Reset on destination change
    const controller = new AbortController();

    fetch(`/api/destination-photo?q=${encodeURIComponent(destination)}`, { signal: controller.signal })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data?.photoUrl) {
          setCoverImage(d.data.photoUrl);
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') console.error('Photo fetch failed:', err);
      });

    return () => controller.abort();
  }, [destination]);

  /* Places data */
  const { data: placesData, isLoading: placesLoading, isError: placesError } = useQuery<{
    restaurants: PlaceSearchResult[];
    hotels: PlaceSearchResult[];
    attractions: PlaceSearchResult[];
  }>({
    queryKey: ['recommendations', destination],
    queryFn: async () => {
      const res = await fetch(`/api/recommendations?destination=${encodeURIComponent(destination)}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    staleTime: 30 * 60 * 1000,
    retry: 1,
    enabled: activeTab === 'places' || activeTab === 'overview',
  });

  /* Videos data */
  const { data: videos = [], isLoading: videosLoading } = useQuery<YouTubeVideo[]>({
    queryKey: ['youtube-videos', destination],
    queryFn: async () => {
      const res = await fetch(`/api/videos/search?destination=${encodeURIComponent(destination)}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.data;
    },
    staleTime: 24 * 60 * 60 * 1000,
    enabled: activeTab === 'videos' || activeTab === 'overview',
  });

  const currentPlaces: PlaceSearchResult[] = placesData?.[placeTab] ?? [];
  const currentPlaceTabMeta = PLACE_TABS.find(t => t.key === placeTab)!;

  return (
    <>
    <div className="min-h-screen bg-background pb-28 md:pb-0">

      {/* ═══════════════════════════════════════════════ */}
      {/* HERO — Immersive                               */}
      {/* ═══════════════════════════════════════════════ */}
      <div ref={heroRef} className="relative h-[340px] md:h-[420px] overflow-hidden">
        {/* Photo / Gradient */}
        <motion.div className="absolute inset-0" style={{ y: heroY }}>
          {coverImage ? (
            <motion.img
              src={coverImage}
              alt={destination}
              className="w-full h-full object-cover"
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          ) : (
            <div className={cn('w-full h-full bg-gradient-to-br', gradient)}>
              <div className="absolute inset-0 bg-dot-grid opacity-10" />
            </div>
          )}
        </motion.div>

        {/* Bottom gradient — legibility only, not covering the full photo */}
        <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-black/75 via-black/30 to-transparent pointer-events-none" />
        {/* Top vignette — subtle, for top bar buttons */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ opacity: heroOpacity }}
          className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 md:p-6 z-10"
        >
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/30 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className={cn(
                'w-10 h-10 rounded-2xl backdrop-blur-md border flex items-center justify-center transition-all',
                isSaved
                  ? 'bg-red-500/80 border-red-400/50 text-white'
                  : 'bg-black/20 border-white/10 text-white hover:bg-black/30'
              )}
            >
              <Heart className={cn('w-4 h-4', isSaved && 'fill-current')} />
            </button>
            <button className="w-10 h-10 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/30 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Badge */}
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 uppercase tracking-wider mb-3">
              <Globe className="w-3 h-3" />
              Explorar destino
            </span>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight capitalize tracking-tight drop-shadow-lg">
              {destination}
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-base text-white/80 mt-1 max-w-lg line-clamp-2 drop-shadow">
              {meta.desc}
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-3 mt-4">
              <Button
                size="lg"
                onClick={() => router.push('/dashboard/trips/new')}
                className="shadow-lg"
              >
                <Plus className="w-4 h-4" data-icon="inline-start" />
                Planejar viagem
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setActiveTab('places')}
                className="bg-background/60 backdrop-blur-sm"
              >
                Explorar lugares
                <ChevronRight className="w-4 h-4" data-icon="inline-end" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* STICKY NAVIGATION                              */}
      {/* ═══════════════════════════════════════════════ */}
      <div ref={navRef} className="sticky top-0 z-30">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={cn(
            'border-b transition-all duration-300',
            navStuck
              ? 'bg-background/80 backdrop-blur-xl border-border shadow-sm'
              : 'bg-background border-border/50'
          )}
        >
          <div className="max-w-2xl mx-auto px-4 md:px-6">
            <div className="flex gap-1 overflow-x-auto hide-scrollbar py-2">
              {NAV_TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200',
                      isActive
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-0 bg-muted rounded-full -z-10"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* CONTENT                                        */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="max-w-2xl mx-auto px-4 md:px-6 mt-6">
        <AnimatePresence mode="wait">

          {/* ── OVERVIEW ────────────────────────────── */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-8"
            >
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Calendar, label: 'Melhor época', value: meta.bestTime },
                  { icon: Coins,    label: 'Moeda',       value: meta.currency },
                  { icon: Languages,label: 'Idioma',      value: meta.language },
                ].map(stat => (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border text-center"
                  >
                    <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                      <stat.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                      <p className="text-xs font-semibold text-foreground mt-0.5">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Highlights */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Destaques</h3>
                <div className="flex flex-wrap gap-2">
                  {meta.highlights.map(h => (
                    <span key={h} className="inline-flex items-center px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-foreground border border-border">
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Top Places Preview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Principais lugares</h3>
                  <button
                    onClick={() => setActiveTab('places')}
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  >
                    Ver todos <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                {placesLoading ? (
                  <CardSkeleton count={3} />
                ) : placesError ? (
                  <EmptyState icon={Landmark} title="Sem recomendações" subtitle="Configure a API do Google Places para ver recomendações de lugares." />
                ) : (
                  <div className="space-y-2">
                    {(placesData?.attractions ?? []).slice(0, 3).map(place => (
                      <PlaceCard
                        key={place.place_id}
                        place={place}
                        favoriteType="ACTIVITY"
                        onOpen={() => setSelectedPlace({ placeId: place.place_id, name: place.name, favoriteType: 'ACTIVITY' })}
                      />
                    ))}
                    {(placesData?.attractions ?? []).length === 0 && (
                      <EmptyState icon={Landmark} title="Nenhuma atração encontrada" subtitle="Explore outras categorias na aba Lugares." />
                    )}
                  </div>
                )}
              </div>

              {/* Videos Preview */}
              {videos.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-foreground">Vídeos populares</h3>
                    <button
                      onClick={() => setActiveTab('videos')}
                      className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                    >
                      Ver todos <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {videos.slice(0, 2).map((video, i) => (
                      <motion.div key={video.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <YouTubeVideoPlayer video={video} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Map Preview */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-foreground">Localização</h3>
                  <button
                    onClick={() => setActiveTab('map')}
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  >
                    Expandir <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <GoogleMapView markers={[]} height="200px" defaultCenter={destination} />
              </div>
            </motion.div>
          )}

          {/* ── PLACES ──────────────────────────────── */}
          {activeTab === 'places' && (
            <motion.div
              key="places"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {/* Place sub-tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                {PLACE_TABS.map(t => {
                  const Icon = t.icon;
                  const count = placesData?.[t.key]?.length;
                  const isActive = placeTab === t.key;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setPlaceTab(t.key)}
                      className={cn(
                        'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border',
                        isActive
                          ? 'bg-foreground text-background border-foreground shadow-sm'
                          : 'bg-card text-muted-foreground border-border hover:border-foreground/20 hover:text-foreground'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {t.label}
                      {count != null && count > 0 && (
                        <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-bold', isActive ? 'bg-background/20' : 'bg-muted')}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Content */}
              {placesLoading && <CardSkeleton count={5} />}
              {placesError && (
                <EmptyState
                  icon={Landmark}
                  title="Sem recomendações disponíveis"
                  subtitle="Configure a chave GOOGLE_PLACES_API_KEY para ver restaurantes, hotéis e atrações."
                />
              )}
              {!placesLoading && !placesError && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={placeTab}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-2"
                  >
                    {currentPlaces.length === 0 ? (
                      <EmptyState
                        icon={currentPlaceTabMeta.icon}
                        title={`Nenhum resultado para ${currentPlaceTabMeta.label.toLowerCase()}`}
                        subtitle="Explore outras categorias ou tente outro destino."
                      />
                    ) : (
                      currentPlaces.map(place => (
                        <PlaceCard
                          key={place.place_id}
                          place={place}
                          favoriteType={currentPlaceTabMeta.favoriteType}
                          onOpen={() => setSelectedPlace({
                            placeId: place.place_id,
                            name: place.name,
                            favoriteType: currentPlaceTabMeta.favoriteType,
                          })}
                        />
                      ))
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </motion.div>
          )}

          {/* ── VIDEOS ──────────────────────────────── */}
          {activeTab === 'videos' && (
            <motion.div
              key="videos"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <p className="text-sm text-muted-foreground mb-4">
                Vídeos sobre <span className="font-semibold text-foreground capitalize">{destination}</span>
              </p>
              {videosLoading ? (
                <VideoSkeleton />
              ) : videos.length === 0 ? (
                <EmptyState
                  icon={Youtube}
                  title="Nenhum vídeo encontrado"
                  subtitle={`Não encontramos vídeos para ${destination} no momento.`}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              )}
            </motion.div>
          )}

          {/* ── MAP ─────────────────────────────────── */}
          {activeTab === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <p className="text-sm text-muted-foreground mb-4">
                Mapa de <span className="font-semibold text-foreground capitalize">{destination}</span>
              </p>
              <GoogleMapView markers={[]} height="480px" defaultCenter={destination} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* FLOATING CTA — Mobile                          */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="fixed bottom-20 md:bottom-6 left-0 right-0 flex justify-center px-4 z-30 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-auto"
        >
          <Button
            size="lg"
            onClick={() => router.push('/dashboard/trips/new')}
            className="shadow-xl shadow-foreground/10 px-6"
          >
            <Plus className="w-4 h-4" data-icon="inline-start" />
            Planejar viagem para <span className="capitalize">{destination}</span>
          </Button>
        </motion.div>
      </div>
    </div>

    {/* Native place detail modal */}
    <AnimatePresence>
      {selectedPlace && (
        <PlaceDetailModal
          key={selectedPlace.placeId}
          placeId={selectedPlace.placeId}
          favoriteType={selectedPlace.favoriteType}
          fallbackName={selectedPlace.name}
          onClose={() => setSelectedPlace(null)}
        />
      )}
    </AnimatePresence>
    </>
  );
}
