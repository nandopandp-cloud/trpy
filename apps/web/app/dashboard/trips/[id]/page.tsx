'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft, Edit2, MapPin, Calendar, Wallet, Plus, Trash2, Loader2,
  Share2, MoreVertical, Youtube, Image as ImageIcon, Map, Compass,
  Camera, Palette, Upload, X, Check, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useTrip, useUpdateTrip } from '@/hooks/useTrip';
import { useDeleteTrip } from '@/hooks/useTrips';
import { ItineraryDay } from '@/components/itinerary/itinerary-day';
import { BudgetDashboard } from '@/components/budget/budget-dashboard';
import { ExpenseForm } from '@/components/budget/expense-form';
import { Button } from '@/components/ui/button';
import { DashboardSkeleton } from '@/components/ui/skeletons';
import { FavoriteButton } from '@/components/favorites/favorite-button';
import { YouTubeGallery } from '@/components/integrations/youtube/youtube-gallery';
import { PinterestGallery } from '@/components/integrations/pinterest/pinterest-gallery';
import { GoogleMapView, type MapMarker } from '@/components/integrations/google/google-map-view';
import { PlacesRecommendations } from '@/components/integrations/google/places-recommendations';
import { cn } from '@/lib/utils';
import type { ItineraryItem } from '@trpy/database';

// ─── constants ────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  PLANNING:  'bg-sky-500/25 text-sky-300 border border-sky-500/40',
  ONGOING:   'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40',
  COMPLETED: 'bg-slate-500/25 text-slate-300 border border-slate-500/40',
  CANCELLED: 'bg-red-500/25 text-red-300 border border-red-500/40',
};
const STATUS_LABEL: Record<string, string> = {
  PLANNING: 'Planejando', ONGOING: 'Em andamento',
  COMPLETED: 'Concluída', CANCELLED: 'Cancelada',
};

const PRESET_GRADIENTS = [
  { id: 'emerald',  class: 'from-emerald-600 via-teal-600 to-cyan-700',     label: 'Tropical' },
  { id: 'violet',   class: 'from-violet-700 via-purple-700 to-indigo-800',   label: 'Noturno' },
  { id: 'rose',     class: 'from-rose-600 via-pink-600 to-fuchsia-700',      label: 'Romance' },
  { id: 'amber',    class: 'from-amber-600 via-orange-600 to-red-600',       label: 'Deserto' },
  { id: 'blue',     class: 'from-sky-600 via-blue-700 to-indigo-700',        label: 'Oceano' },
  { id: 'slate',    class: 'from-slate-600 via-slate-700 to-zinc-800',       label: 'Urbano' },
];

const TABS = [
  { id: 'itinerary', label: 'Itinerário' },
  { id: 'budget',    label: 'Despesas' },
  { id: 'map',       label: 'Mapa' },
  { id: 'discover',  label: 'Descobrir' },
  { id: 'videos',    label: 'Vídeos' },
  { id: 'inspo',     label: 'Inspiração' },
] as const;

type TabId = typeof TABS[number]['id'];

function gradientFromId(id: string) {
  return PRESET_GRADIENTS[id.charCodeAt(0) % PRESET_GRADIENTS.length].class;
}

// ─── CoverPicker modal ────────────────────────────────────────────────────────

interface CoverPickerProps {
  tripId: string;
  current: string | null | undefined;
  gradientFallback: string;
  onClose: () => void;
  onSaved: (url: string | null) => void;
}

function CoverPicker({ tripId, current, gradientFallback, onClose, onSaved }: CoverPickerProps) {
  const [tab, setTab] = useState<'upload' | 'url' | 'gradient'>('gradient');
  const [urlInput, setUrlInput] = useState(current ?? '');
  const [selectedGradient, setSelectedGradient] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function save(coverImage: string | null) {
    setSaving(true);
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverImage }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      onSaved(coverImage);
      toast.success('Capa atualizada!');
      onClose();
    } catch {
      toast.error('Erro ao salvar capa');
    } finally {
      setSaving(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      save(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
        className="w-full sm:max-w-md bg-card border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Camera className="w-4 h-4 text-primary" />
            </div>
            <p className="font-bold text-foreground">Editar capa</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab strip */}
        <div className="flex border-b border-border">
          {[
            { id: 'gradient' as const, icon: Palette, label: 'Gradiente' },
            { id: 'url' as const, icon: ImageIcon, label: 'URL' },
            { id: 'upload' as const, icon: Upload, label: 'Upload' },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors border-b-2',
                  tab === t.id
                    ? 'text-primary border-primary'
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="p-5 space-y-4">
          {/* Gradient picker */}
          {tab === 'gradient' && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Escolha um gradiente predefinido</p>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_GRADIENTS.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGradient(g.class)}
                    className={cn(
                      'relative h-20 rounded-2xl bg-gradient-to-br overflow-hidden transition-all ring-2',
                      g.class,
                      selectedGradient === g.class ? 'ring-primary scale-[0.97]' : 'ring-transparent hover:scale-[0.97]'
                    )}
                  >
                    {selectedGradient === g.class && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    )}
                    <span className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-semibold text-white/90">
                      {g.label}
                    </span>
                  </button>
                ))}
              </div>
              {selectedGradient && (
                <button
                  onClick={() => save(`gradient:${selectedGradient}`)}
                  disabled={saving}
                  className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Aplicar gradiente
                </button>
              )}
            </div>
          )}

          {/* URL tab */}
          {tab === 'url' && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Cole a URL de uma imagem</p>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="w-full px-4 py-3 rounded-2xl border border-border bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              {urlInput && (
                <div className="h-28 rounded-2xl overflow-hidden bg-muted">
                  <img src={urlInput} alt="" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              )}
              <button
                onClick={() => save(urlInput || null)}
                disabled={saving || !urlInput}
                className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Salvar imagem
              </button>
            </div>
          )}

          {/* Upload tab */}
          {tab === 'upload' && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Envie uma imagem do dispositivo</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={saving}
                className="w-full h-28 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 flex flex-col items-center justify-center gap-2 transition-colors group"
              >
                <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {saving ? 'Salvando…' : 'Clique para selecionar'}
                </span>
              </button>
            </div>
          )}

          {/* Remove cover */}
          {(current && !current.startsWith('gradient:')) && (
            <button
              onClick={() => save(null)}
              disabled={saving}
              className="w-full py-2.5 rounded-2xl text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Remover capa personalizada
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Sticky tab bar ───────────────────────────────────────────────────────────

function StickyTabs({ active, onChange, counts }: {
  active: TabId;
  onChange: (tab: TabId) => void;
  counts: Partial<Record<TabId, number>>;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="sticky top-16 z-20 bg-background/90 backdrop-blur-xl border-b border-border"
    >
      <div className="max-w-2xl mx-auto px-0">
        <div className="flex overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => {
            const isActive = active === tab.id;
            const count = counts[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={cn(
                  'relative flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
                {count != null && count > 0 && (
                  <span className={cn(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight',
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}>
                    {count}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Budget summary strip ─────────────────────────────────────────────────────

function BudgetStrip({ currency, budget, spent }: { currency: string; budget: number; spent: number }) {
  const remaining = budget - spent;
  const progress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOver = remaining < 0;

  return (
    <div className="bg-card border border-border rounded-3xl px-5 py-4 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
          <Wallet className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="text-sm font-bold text-foreground">Orçamento</span>
        <span className={cn(
          'ml-auto text-xs font-bold px-2 py-0.5 rounded-full',
          isOver ? 'bg-destructive/15 text-destructive' :
          progress >= 80 ? 'bg-amber-500/15 text-amber-500' :
          'bg-emerald-500/15 text-emerald-500'
        )}>
          {isOver ? 'Estourado' : `${progress.toFixed(0)}%`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
        <motion.div
          className={cn(
            'h-full rounded-full bg-gradient-to-r',
            progress >= 90 ? 'from-red-500 to-orange-400' :
            progress >= 70 ? 'from-amber-500 to-yellow-400' :
            'from-emerald-500 to-teal-400'
          )}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.3 }}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Total', value: budget, color: 'text-foreground' },
          { label: 'Gasto', value: spent, color: progress >= 90 ? 'text-destructive' : 'text-foreground' },
          { label: 'Restante', value: Math.abs(remaining), color: isOver ? 'text-destructive' : 'text-emerald-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-muted/50 rounded-2xl px-3 py-2.5 text-center">
            <p className={cn('text-sm font-bold tabular-nums', stat.color)}>
              {isOver && stat.label === 'Restante' && '-'}
              {stat.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground text-right mt-2">{currency}</p>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyTab({ icon, title, desc, cta, onCta }: {
  icon: string; title: string; desc: string; cta?: string; onCta?: () => void;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-border p-12 text-center space-y-3">
      <div className="text-4xl">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">{desc}</p>
      </div>
      {cta && onCta && (
        <button onClick={onCta} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors mt-1">
          <Plus className="w-3.5 h-3.5" /> {cta}
        </button>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TripDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>('itinerary');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [coverOverride, setCoverOverride] = useState<string | null | undefined>(undefined);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 200], [1, 0.6]);

  const { data: trip, isLoading, isError } = useTrip(params.id);
  const deleteTrip = useDeleteTrip();

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await fetch(`/api/itinerary-items/${itemId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trip', params.id] }),
    onError: () => toast.error('Erro ao excluir atividade'),
  });

  // Resolve cover: override from picker > db value > gradient fallback
  const coverImage = coverOverride !== undefined ? coverOverride : trip?.coverImage;
  const gradientFallback = trip ? gradientFromId(trip.id) : PRESET_GRADIENTS[0].class;

  // Parse cover — might be "gradient:from-..." or a real URL
  const isGradientCover = !coverImage || coverImage.startsWith('gradient:');
  const gradientClass = isGradientCover
    ? (coverImage?.replace('gradient:', '') ?? gradientFallback)
    : null;

  async function handleDeleteTrip() {
    setShowActions(false);
    if (!confirm(`Excluir "${trip?.title}"?`)) return;
    await deleteTrip.mutateAsync(params.id);
    toast.success('Viagem excluída');
    router.push('/dashboard/trips');
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (isError || !trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="text-5xl">🗺️</div>
          <p className="text-base font-semibold text-foreground">Viagem não encontrada</p>
          <p className="text-sm text-muted-foreground">Ela pode ter sido removida ou você não tem acesso.</p>
          <Button variant="outline" onClick={() => router.push('/dashboard/trips')}>
            Voltar para viagens
          </Button>
        </div>
      </div>
    );
  }

  const budget = Number(trip.budget);
  const spent = Number(trip.totalSpent);
  const tripDays = Math.max(1, differenceInDays(new Date(trip.endDate), new Date(trip.startDate)));

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-8">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div ref={heroRef} className="relative h-64 md:h-80 overflow-hidden">

        {/* Cover layer with parallax */}
        <motion.div className="absolute inset-0" style={{ scale: 1.05 }}>
          {isGradientCover ? (
            <div className={cn('w-full h-full bg-gradient-to-br', gradientClass)} />
          ) : (
            <img
              src={coverImage!}
              alt={trip.title}
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.3)_100%)]" />

        {/* Top action bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 md:p-5">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
            onClick={() => router.back()}
            className="w-9 h-9 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/45 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.button>

          <div className="flex gap-2">
            <FavoriteButton
              type="PLACE" externalId={params.id} name={trip.title}
              image={isGradientCover ? undefined : coverImage ?? undefined}
              size="md" className="w-9 h-9 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 text-white"
            />
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
              onClick={() => setShowCoverPicker(true)}
              className="w-9 h-9 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/45 transition-colors"
              title="Editar capa"
            >
              <Camera className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
              onClick={() => router.push(`/dashboard/trips/${params.id}/edit`)}
              className="w-9 h-9 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/45 transition-colors"
              title="Editar viagem"
            >
              <Edit2 className="w-4 h-4" />
            </motion.button>

            {/* Actions menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
                onClick={() => setShowActions(!showActions)}
                className="w-9 h-9 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/45 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </motion.button>
              <AnimatePresence>
                {showActions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-11 w-48 rounded-2xl bg-card border border-border shadow-card-lg overflow-hidden z-50"
                  >
                    <button
                      onClick={() => { setShowActions(false); toast.info('Compartilhamento em breve'); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted transition-colors text-left"
                    >
                      <Share2 className="w-4 h-4 text-muted-foreground" /> Compartilhar
                    </button>
                    <button
                      onClick={handleDeleteTrip}
                      disabled={deleteTrip.isPending}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                    >
                      {deleteTrip.isPending
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2 className="w-4 h-4" />}
                      Excluir viagem
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 md:px-6 md:pb-6">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <span className={cn('inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full mb-2', STATUS_STYLE[trip.status])}>
              {STATUS_LABEL[trip.status]}
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-md">
              {trip.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
              <span className="flex items-center gap-1.5 text-white/80 text-sm">
                <MapPin className="w-3.5 h-3.5 shrink-0" />{trip.destination}
              </span>
              <span className="flex items-center gap-1.5 text-white/80 text-sm">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                {format(new Date(trip.startDate), "d MMM", { locale: ptBR })}
                {' — '}
                {format(new Date(trip.endDate), "d MMM yyyy", { locale: ptBR })}
                <span className="text-white/50">· {tripDays}d</span>
              </span>
            </div>
          </motion.div>
        </div>

      </div>

      {/* ── STICKY TABS ───────────────────────────────────────────────────── */}
      <StickyTabs
        active={activeTab}
        onChange={setActiveTab}
        counts={{
          itinerary: trip.itineraryDays.length,
          budget: trip.expenses.length,
        }}
      />

      {/* ── BODY ──────────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* Budget strip — always visible */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <BudgetStrip currency={trip.currency} budget={budget} spent={spent} />
        </motion.div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >

            {/* ── Itinerário ────────────────────────────────────────── */}
            {activeTab === 'itinerary' && (
              <div className="space-y-3">
                {trip.itineraryDays.length === 0 ? (
                  <EmptyTab
                    icon="🗓️"
                    title="Itinerário vazio"
                    desc="Adicione dias e atividades para planejar sua viagem."
                    cta="Adicionar dia"
                    onCta={() => toast.info('Em breve: adicionar dias de itinerário')}
                  />
                ) : (
                  trip.itineraryDays.map((day) => (
                    <ItineraryDay
                      key={day.id}
                      day={day}
                      onAddItem={(dayId) => toast.info(`Adicionar item ao dia ${dayId} (em breve)`)}
                      onEditItem={(item: ItineraryItem) => toast.info(`Editar ${item.title} (em breve)`)}
                      onDeleteItem={(itemId) => {
                        if (confirm('Excluir atividade?')) deleteItemMutation.mutate(itemId);
                      }}
                    />
                  ))
                )}
              </div>
            )}

            {/* ── Despesas ──────────────────────────────────────────── */}
            {activeTab === 'budget' && (
              <div className="space-y-4">
                <BudgetDashboard trip={trip} expenses={trip.expenses} />
                {trip.expenses.length === 0 && (
                  <EmptyTab
                    icon="💸"
                    title="Nenhuma despesa"
                    desc="Registre seus gastos para controlar o orçamento."
                    cta="Adicionar despesa"
                    onCta={() => setShowExpenseForm(true)}
                  />
                )}
              </div>
            )}

            {/* ── Mapa ──────────────────────────────────────────────── */}
            {activeTab === 'map' && (
              <div className="space-y-3">
                {(() => {
                  const markers: MapMarker[] = trip.itineraryDays
                    .flatMap((d) => d.items)
                    .filter((item) => item.latitude != null && item.longitude != null)
                    .map((item) => ({
                      lat: Number(item.latitude),
                      lng: Number(item.longitude),
                      title: item.title,
                      type: (item.type as MapMarker['type']) ?? 'OTHER',
                    }));
                  return (
                    <>
                      {markers.length === 0 && (
                        <div className="rounded-2xl bg-muted/50 border border-border px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                          <Map className="w-4 h-4 shrink-0 text-primary" />
                          Atividades com coordenadas aparecem aqui como marcadores.
                        </div>
                      )}
                      <div className="rounded-3xl overflow-hidden border border-border shadow-card">
                        <GoogleMapView markers={markers} height="420px" />
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* ── Descobrir ─────────────────────────────────────────── */}
            {activeTab === 'discover' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">
                    O que fazer em <span className="text-primary">{trip.destination}</span>
                  </p>
                </div>
                <PlacesRecommendations destination={trip.destination} />
              </div>
            )}

            {/* ── Vídeos ────────────────────────────────────────────── */}
            {activeTab === 'videos' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-500" />
                  <p className="text-sm font-semibold text-foreground">
                    Vídeos sobre <span className="text-primary">{trip.destination}</span>
                  </p>
                </div>
                <YouTubeGallery destination={trip.destination} />
              </div>
            )}

            {/* ── Inspiração ────────────────────────────────────────── */}
            {activeTab === 'inspo' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-pink-500" />
                  <p className="text-sm font-semibold text-foreground">
                    Inspirações para <span className="text-primary">{trip.destination}</span>
                  </p>
                </div>
                <PinterestGallery destination={trip.destination} theme="travel" />
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── FLOATING CTA ──────────────────────────────────────────────────── */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-30">
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowExpenseForm(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:opacity-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Adicionar despesa</span>
          <span className="sm:hidden">Despesa</span>
        </motion.button>
      </div>

      {/* ── EXPENSE FORM MODAL ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showExpenseForm && (
          <ExpenseForm tripId={params.id} onClose={() => setShowExpenseForm(false)} />
        )}
      </AnimatePresence>

      {/* ── COVER PICKER MODAL ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCoverPicker && (
          <CoverPicker
            tripId={params.id}
            current={coverImage}
            gradientFallback={gradientFallback}
            onClose={() => setShowCoverPicker(false)}
            onSaved={(url) => {
              setCoverOverride(url);
              queryClient.invalidateQueries({ queryKey: ['trip', params.id] });
            }}
          />
        )}
      </AnimatePresence>

      {/* Click-away for actions menu */}
      {showActions && (
        <div className="fixed inset-0 z-40" onClick={() => setShowActions(false)} />
      )}
    </div>
  );
}
