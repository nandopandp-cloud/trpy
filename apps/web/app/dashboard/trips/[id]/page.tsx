'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
import { ItineraryItemForm } from '@/components/itinerary/itinerary-item-form';
import { AddDayForm } from '@/components/itinerary/add-day-form';
import { BudgetDashboard } from '@/components/budget/budget-dashboard';
import { ExpenseForm } from '@/components/budget/expense-form';
import { TripShareModal } from '@/components/trips/trip-share-modal';
import { Button } from '@/components/ui/button';
import { DashboardSkeleton } from '@/components/ui/skeletons';
import { FavoriteButton } from '@/components/favorites/favorite-button';
import { YouTubeGallery } from '@/components/integrations/youtube/youtube-gallery';
import { InspirationGallery } from '@/components/trips/inspiration-gallery';
import { GoogleMapView, type MapMarker } from '@/components/integrations/google/google-map-view';
import { PlacesRecommendations } from '@/components/integrations/google/places-recommendations';
import { cn } from '@/lib/utils';
import { useLocale, t } from '@/lib/i18n';
import { useConfirm } from '@/components/ui/confirm-dialog';
import type { ItineraryItem } from '@trpy/database';

// ─── constants ────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, string> = {
  PLANNING:  'bg-sky-500/25 text-sky-300 border border-sky-500/40',
  ONGOING:   'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40',
  COMPLETED: 'bg-slate-500/25 text-slate-300 border border-slate-500/40',
  CANCELLED: 'bg-red-500/25 text-red-300 border border-red-500/40',
};
const STATUS_LABEL_KEY: Record<string, string> = {
  PLANNING: 'status.planning', ONGOING: 'status.ongoing',
  COMPLETED: 'status.completed', CANCELLED: 'status.cancelled',
};

const PRESET_GRADIENTS = [
  { id: 'emerald',  class: 'from-emerald-600 via-teal-600 to-cyan-700',     labelKey: 'gradient.tropical' },
  { id: 'violet',   class: 'from-violet-700 via-purple-700 to-indigo-800',   labelKey: 'gradient.night' },
  { id: 'rose',     class: 'from-rose-600 via-pink-600 to-fuchsia-700',      labelKey: 'gradient.romance' },
  { id: 'amber',    class: 'from-amber-600 via-orange-600 to-red-600',       labelKey: 'gradient.desert' },
  { id: 'blue',     class: 'from-sky-600 via-blue-700 to-indigo-700',        labelKey: 'gradient.ocean' },
  { id: 'slate',    class: 'from-slate-600 via-slate-700 to-zinc-800',       labelKey: 'gradient.urban' },
];

const TABS_BASE = [
  { id: 'itinerary', labelKey: 'tab.itinerary' },
  { id: 'budget',    labelKey: 'tab.budget' },
  { id: 'map',       labelKey: 'tab.map' },
  { id: 'discover',  labelKey: 'tab.discover' },
  { id: 'videos',    labelKey: 'tab.videos' },
  { id: 'inspo',     labelKey: 'tab.inspo' },
] as const;

const TABS = TABS_BASE;

type TabId = typeof TABS[number]['id'];

function gradientFromId(id: string) {
  return PRESET_GRADIENTS[id.charCodeAt(0) % PRESET_GRADIENTS.length].class;
}

// ─── CoverPicker modal ────────────────────────────────────────────────────────

interface PexelsPhoto {
  id: string;
  url: string;
  thumb: string;
  alt: string;
  photographer: string;
}

interface CoverPickerProps {
  tripId: string;
  destination: string;
  current: string | null | undefined;
  gradientFallback: string;
  onClose: () => void;
  onSaved: (url: string | null) => void;
}

function CoverPicker({ tripId, destination, current, gradientFallback, onClose, onSaved }: CoverPickerProps) {
  const [locale] = useLocale();
  const [tab, setTab] = useState<'photos' | 'gradient' | 'url' | 'upload'>('photos');
  const [urlInput, setUrlInput] = useState(current ?? '');
  const [selectedGradient, setSelectedGradient] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [photosError, setPhotosError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = useCallback(async () => {
    setPhotosLoading(true);
    setPhotosError(false);
    try {
      const res = await fetch(`/api/pexels-photos?q=${encodeURIComponent(destination)}&per_page=10`);
      const json = await res.json();
      if (!json.success) throw new Error();
      setPhotos(json.data.photos);
    } catch {
      setPhotosError(true);
    } finally {
      setPhotosLoading(false);
    }
  }, [destination]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

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
      toast.success(t(locale, 'cover.saved' as any));
      onClose();
    } catch {
      toast.error(t(locale, 'cover.error' as any));
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
            <p className="font-bold text-foreground">{t(locale, 'cover.edit' as any)}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab strip */}
        <div className="flex border-b border-border">
          {[
            { id: 'photos' as const, icon: ImageIcon, labelKey: 'cover.photos' },
            { id: 'gradient' as const, icon: Palette, labelKey: 'cover.gradient' },
            { id: 'url' as const, icon: Camera, labelKey: 'cover.url' },
            { id: 'upload' as const, icon: Upload, labelKey: 'cover.upload' },
          ].map((ct) => {
            const Icon = ct.icon;
            return (
              <button
                key={ct.id}
                onClick={() => setTab(ct.id)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-semibold transition-colors border-b-2',
                  tab === ct.id
                    ? 'text-primary border-primary'
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                {t(locale, ct.labelKey as any)}
              </button>
            );
          })}
        </div>

        <div className="p-5 space-y-4">
          {/* Photos tab */}
          {tab === 'photos' && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">{t(locale, 'cover.photos_desc' as any)}</p>
              {photosLoading && (
                <div className="flex items-center justify-center py-10 gap-2 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t(locale, 'cover.photos_loading' as any)}
                </div>
              )}
              {photosError && !photosLoading && (
                <div className="flex flex-col items-center justify-center py-8 gap-3 text-sm text-muted-foreground">
                  <p>{t(locale, 'cover.photos_error' as any)}</p>
                  <button
                    onClick={fetchPhotos}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    {t(locale, 'cover.photos_retry' as any)}
                  </button>
                </div>
              )}
              {!photosLoading && !photosError && photos.length > 0 && (
                <div className="grid grid-cols-2 gap-2 max-h-[340px] overflow-y-auto pr-0.5">
                  {photos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => save(photo.url)}
                      disabled={saving}
                      className="relative group h-28 rounded-2xl overflow-hidden bg-muted ring-2 ring-transparent hover:ring-primary transition-all"
                      title={photo.alt}
                    >
                      <img
                        src={photo.thumb}
                        alt={photo.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-semibold text-white bg-black/50 rounded-full px-2 py-0.5">
                          {t(locale, 'cover.use_photo' as any)}
                        </span>
                      </div>
                      <span className="absolute bottom-1 right-1 text-[9px] text-white/60 bg-black/30 rounded px-1 truncate max-w-[80px]">
                        {photo.photographer}
                      </span>
                      {saving && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Gradient picker */}
          {tab === 'gradient' && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">{t(locale, 'cover.choose_gradient' as any)}</p>
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
                      {t(locale, g.labelKey as any)}
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
                  {t(locale, 'cover.apply_gradient' as any)}
                </button>
              )}
            </div>
          )}

          {/* URL tab */}
          {tab === 'url' && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">{t(locale, 'cover.paste_url' as any)}</p>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={t(locale, 'cover.url_placeholder' as any)}
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
                {t(locale, 'cover.save_image' as any)}
              </button>
            </div>
          )}

          {/* Upload tab */}
          {tab === 'upload' && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">{t(locale, 'cover.upload_desc' as any)}</p>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={saving}
                className="w-full h-28 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 flex flex-col items-center justify-center gap-2 transition-colors group"
              >
                <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {saving ? t(locale, 'cover.saving' as any) : t(locale, 'cover.click_select' as any)}
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
              {t(locale, 'cover.remove' as any)}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Sticky tab bar ───────────────────────────────────────────────────────────

function StickyTabs({
  active,
  onChange,
  counts,
  availableTabs,
  locale,
}: {
  active: TabId;
  onChange: (tab: TabId) => void;
  counts: Partial<Record<TabId, number>>;
  availableTabs: Array<{ id: TabId; labelKey: string }>;
  locale: any;
}) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border"
    >
      <div className="max-w-2xl mx-auto px-0">
        <div className="flex overflow-x-auto scrollbar-hide">
          {availableTabs.map((tab) => {
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
                {t(locale, tab.labelKey as any)}
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
  const [locale] = useLocale();
  const remaining = budget - spent;
  const progress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOver = remaining < 0;

  return (
    <div className="bg-card border border-border rounded-3xl px-5 py-4 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
          <Wallet className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="text-sm font-bold text-foreground">{t(locale, 'trip.budget_label' as any)}</span>
        <span className={cn(
          'ml-auto text-xs font-bold px-2 py-0.5 rounded-full',
          isOver ? 'bg-destructive/15 text-destructive' :
          progress >= 80 ? 'bg-amber-500/15 text-amber-500' :
          'bg-emerald-500/15 text-emerald-500'
        )}>
          {isOver ? t(locale, 'trip.over_budget' as any) : `${progress.toFixed(0)}%`}
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
          { label: t(locale, 'trip.total' as any), key: 'total', value: budget, color: 'text-foreground' },
          { label: t(locale, 'trip.spent' as any), key: 'spent', value: spent, color: progress >= 90 ? 'text-destructive' : 'text-foreground' },
          { label: t(locale, 'trip.remaining' as any), key: 'remaining', value: Math.abs(remaining), color: isOver ? 'text-destructive' : 'text-emerald-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-muted/50 rounded-2xl px-3 py-2.5 text-center">
            <p className={cn('text-sm font-bold tabular-nums', stat.color)}>
              {isOver && stat.key === 'remaining' && '-'}
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
  const [locale] = useLocale();
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState<TabId>('itinerary');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showAddDay, setShowAddDay] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [coverOverride, setCoverOverride] = useState<string | null | undefined>(undefined);
  // Itinerary item form state
  const [itemFormState, setItemFormState] = useState<{
    open: boolean;
    dayId: string;
    dayLabel: string;
    item?: ItineraryItem;
  }>({ open: false, dayId: '', dayLabel: '' });

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

  const deleteDayMutation = useMutation({
    mutationFn: async (dayId: string) => {
      const res = await fetch(`/api/itinerary-days/${dayId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trip', params.id] });
      toast.success('Dia removido do itinerário');
    },
    onError: () => toast.error('Erro ao excluir dia'),
  });

  // Resolve cover: override from picker > db value > gradient fallback
  const coverImage = coverOverride !== undefined ? coverOverride : trip?.coverImage;
  const gradientFallback = trip ? gradientFromId(trip.id) : PRESET_GRADIENTS[0].class;

  // Parse cover — might be "gradient:from-..." or a real URL
  const isGradientCover = !coverImage || coverImage.startsWith('gradient:');
  const gradientClass = isGradientCover
    ? (coverImage?.replace('gradient:', '') ?? gradientFallback)
    : null;

  // If "Mapa" tab becomes unavailable while selected, fall back to itinerary
  const hasCoords = trip?.itineraryDays?.some((d: any) =>
    d.items?.some((item: any) => item.latitude != null && item.longitude != null)
  ) ?? false;
  useEffect(() => {
    if (!hasCoords && activeTab === 'map') {
      setActiveTab('itinerary');
    }
  }, [hasCoords, activeTab]);

  async function handleDeleteTrip() {
    setShowActions(false);
    const ok = await confirm({
      title: 'Excluir viagem?',
      description: 'Esta ação não pode ser desfeita. Todo o itinerário, despesas e dados serão removidos permanentemente.',
      detail: trip?.title,
      confirmLabel: 'Excluir viagem',
      cancelLabel: 'Cancelar',
      variant: 'danger',
    });
    if (!ok) return;
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
          <p className="text-base font-semibold text-foreground">{t(locale, 'trip.not_found' as any)}</p>
          <p className="text-sm text-muted-foreground">{t(locale, 'trip.not_found_desc' as any)}</p>
          <Button variant="outline" onClick={() => router.push('/dashboard/trips')}>
            {t(locale, 'trip.back_to_trips' as any)}
          </Button>
        </div>
      </div>
    );
  }

  const budget = Number(trip.budget);
  const spent = Number(trip.totalSpent);
  const tripDays = Math.max(1, differenceInDays(new Date(trip.endDate), new Date(trip.startDate)));

  // Compute visible tabs — hide "Mapa" if no coordinates exist
  const visibleTabs: Array<{ id: TabId; labelKey: string }> = hasCoords
    ? Array.from(TABS)
    : Array.from(TABS).filter((t) => t.id !== 'map');

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-8">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div className="relative h-64 md:h-80 overflow-hidden">

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

        {/* Overlays — stronger gradient for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/80" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)]" />

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
              title={t(locale, 'cover.edit' as any)}
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
                      onClick={() => { setShowActions(false); setShowShareModal(true); }}
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
              {t(locale, (STATUS_LABEL_KEY[trip.status] ?? 'status.planning') as any)}
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
        availableTabs={visibleTabs}
        locale={locale}
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
                    desc="Organize sua viagem adicionando dias e atividades."
                    cta="Adicionar primeiro dia"
                    onCta={() => setShowAddDay(true)}
                  />
                ) : (
                  <>
                    {trip.itineraryDays.map((day) => {
                      const dayLabel = `${day.title ?? `Dia ${day.dayNumber}`} · ${
                        new Date(day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
                      }`;
                      return (
                        <ItineraryDay
                          key={day.id}
                          day={day}
                          onAddItem={(dayId) =>
                            setItemFormState({ open: true, dayId, dayLabel })
                          }
                          onEditItem={(item: ItineraryItem) =>
                            setItemFormState({
                              open: true,
                              dayId: item.dayId,
                              dayLabel,
                              item,
                            })
                          }
                          onDeleteItem={async (itemId) => {
                            const ok = await confirm({
                              title: 'Excluir atividade?',
                              description: 'A atividade será removida do itinerário permanentemente.',
                              confirmLabel: 'Excluir',
                              variant: 'danger',
                            });
                            if (ok) deleteItemMutation.mutate(itemId);
                          }}
                          onDeleteDay={async (dayId) => {
                            const ok = await confirm({
                              title: 'Excluir este dia?',
                              description: 'Todas as atividades planejadas para este dia serão removidas permanentemente.',
                              confirmLabel: 'Excluir dia',
                              variant: 'danger',
                            });
                            if (ok) deleteDayMutation.mutate(dayId);
                          }}
                        />
                      );
                    })}

                    {/* Add day button */}
                    <button
                      onClick={() => setShowAddDay(true)}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-3xl border border-dashed border-border text-sm font-medium text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar dia ao itinerário
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ── Despesas ──────────────────────────────────────────── */}
            {activeTab === 'budget' && (
              <div className="space-y-4">
                <BudgetDashboard trip={trip} expenses={trip.expenses} tripId={params.id} />
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
                          Mapa do destino: {trip.destination}
                        </div>
                      )}
                      <div className="rounded-3xl overflow-hidden border border-border shadow-card">
                        <GoogleMapView
                          markers={markers}
                          height="420px"
                          defaultCenter={markers.length === 0 ? trip.destination : undefined}
                        />
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
                <InspirationGallery destination={trip.destination} />
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

      {/* ── SHARE MODAL ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showShareModal && trip && (
          <TripShareModal trip={trip as any} onClose={() => setShowShareModal(false)} />
        )}
      </AnimatePresence>

      {/* ── ITINERARY ITEM FORM MODAL ─────────────────────────────────────── */}
      <AnimatePresence>
        {itemFormState.open && (
          <ItineraryItemForm
            tripId={params.id}
            dayId={itemFormState.dayId}
            dayLabel={itemFormState.dayLabel}
            item={itemFormState.item}
            onClose={() => setItemFormState({ open: false, dayId: '', dayLabel: '' })}
          />
        )}
      </AnimatePresence>

      {/* ── ADD DAY FORM MODAL ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddDay && (
          <AddDayForm
            tripId={params.id}
            nextDayNumber={(trip?.itineraryDays.length ?? 0) + 1}
            onClose={() => setShowAddDay(false)}
          />
        )}
      </AnimatePresence>

      {/* ── COVER PICKER MODAL ────────────────────────────────────────────── */}
      <AnimatePresence>
        {showCoverPicker && (
          <CoverPicker
            tripId={params.id}
            destination={trip?.destination ?? ''}
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
