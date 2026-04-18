'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal, Star, DollarSign, Clock, X,
  ChevronDown, TrendingUp, TrendingDown, MessageSquare,
  ArrowUpDown, Sparkles, Check,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { PlaceSearchResult } from '@/lib/integrations/google/places-service';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortOption =
  | 'relevance'
  | 'rating_desc'
  | 'rating_asc'
  | 'reviews_desc'
  | 'price_asc'
  | 'price_desc';

export interface PlacesFilters {
  minRating: number | null;
  maxRating: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  openNow: boolean | null;
  minReviews: number | null;
  sort: SortOption;
}

export const DEFAULT_FILTERS: PlacesFilters = {
  minRating: null,
  maxRating: null,
  minPrice: null,
  maxPrice: null,
  openNow: null,
  minReviews: null,
  sort: 'relevance',
};

export function countActiveFilters(f: PlacesFilters): number {
  let n = 0;
  if (f.minRating != null) n++;
  if (f.maxRating != null) n++;
  if (f.minPrice != null || f.maxPrice != null) n++;
  if (f.openNow != null) n++;
  if (f.minReviews != null) n++;
  if (f.sort !== 'relevance') n++;
  return n;
}

// ─── Filter application ───────────────────────────────────────────────────────

export function applyFilters(
  places: PlaceSearchResult[],
  filters: PlacesFilters,
): PlaceSearchResult[] {
  let result = [...places];

  if (filters.minRating != null)
    result = result.filter((p) => p.rating != null && p.rating >= filters.minRating!);
  if (filters.maxRating != null)
    result = result.filter((p) => p.rating != null && p.rating <= filters.maxRating!);
  if (filters.minPrice != null)
    result = result.filter((p) => p.price_level != null && p.price_level >= filters.minPrice!);
  if (filters.maxPrice != null)
    result = result.filter((p) => p.price_level != null && p.price_level <= filters.maxPrice!);
  if (filters.openNow === true)
    result = result.filter((p) => p.opening_hours?.open_now === true);
  if (filters.minReviews != null)
    result = result.filter(
      (p) => p.user_ratings_total != null && p.user_ratings_total >= filters.minReviews!,
    );

  switch (filters.sort) {
    case 'rating_desc':  result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)); break;
    case 'rating_asc':   result.sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0)); break;
    case 'reviews_desc': result.sort((a, b) => (b.user_ratings_total ?? 0) - (a.user_ratings_total ?? 0)); break;
    case 'price_asc':    result.sort((a, b) => (a.price_level ?? 0) - (b.price_level ?? 0)); break;
    case 'price_desc':   result.sort((a, b) => (b.price_level ?? 0) - (a.price_level ?? 0)); break;
    default: break;
  }

  return result;
}

// ─── Sort options config ──────────────────────────────────────────────────────

interface SortConfig {
  value: SortOption;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  color: string;
  activeBg: string;
  activeText: string;
}

const SORT_OPTIONS: SortConfig[] = [
  {
    value: 'relevance',
    label: 'Relevância',
    shortLabel: 'Relevância',
    icon: <Sparkles className="w-3 h-3" />,
    color: 'text-muted-foreground',
    activeBg: 'bg-foreground',
    activeText: 'text-background',
  },
  {
    value: 'rating_desc',
    label: 'Melhor avaliação',
    shortLabel: 'Melhor nota',
    icon: <Star className="w-3 h-3" fill="currentColor" />,
    color: 'text-amber-500',
    activeBg: 'bg-amber-500',
    activeText: 'text-white',
  },
  {
    value: 'reviews_desc',
    label: 'Mais avaliado',
    shortLabel: 'Mais avaliado',
    icon: <MessageSquare className="w-3 h-3" />,
    color: 'text-violet-500',
    activeBg: 'bg-violet-500',
    activeText: 'text-white',
  },
  {
    value: 'price_asc',
    label: 'Menor preço',
    shortLabel: 'Menor preço',
    icon: <TrendingDown className="w-3 h-3" />,
    color: 'text-emerald-500',
    activeBg: 'bg-emerald-500',
    activeText: 'text-white',
  },
  {
    value: 'price_desc',
    label: 'Maior preço',
    shortLabel: 'Maior preço',
    icon: <TrendingUp className="w-3 h-3" />,
    color: 'text-rose-500',
    activeBg: 'bg-rose-500',
    activeText: 'text-white',
  },
];

// ─── Filter chip presets ──────────────────────────────────────────────────────

const RATING_PRESETS = [
  { label: '4.5+', min: 4.5 },
  { label: '4.0+', min: 4.0 },
  { label: '3.5+', min: 3.5 },
  { label: '3.0+', min: 3.0 },
];

const REVIEWS_PRESETS = [
  { label: '100+',  min: 100 },
  { label: '500+',  min: 500 },
  { label: '1k+',   min: 1000 },
  { label: '5k+',   min: 5000 },
];

const PRICE_LABELS = ['', '$', '$$', '$$$', '$$$$'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FilterSection({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-xs font-semibold text-foreground">{label}</span>
      </div>
      <div className="flex gap-2 flex-wrap">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  activeClass = 'bg-primary text-primary-foreground border-transparent',
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  activeClass?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
        active
          ? activeClass
          : 'bg-muted text-muted-foreground border-border hover:bg-muted/80 hover:text-foreground',
      )}
    >
      {active && (
        <motion.span
          layoutId="chip-check"
          className="flex items-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <Check className="w-3 h-3 mr-0.5" />
        </motion.span>
      )}
      {children}
    </motion.button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface PlacesFilterProps {
  filters: PlacesFilters;
  onChange: (f: PlacesFilters) => void;
  totalCount?: number;
  filteredCount?: number;
}

export function PlacesFilter({
  filters,
  onChange,
  totalCount,
  filteredCount,
}: PlacesFilterProps) {
  const [open, setOpen] = useState(false);
  const activeCount = countActiveFilters(filters);
  const activeSort = SORT_OPTIONS.find((o) => o.value === filters.sort) ?? SORT_OPTIONS[0];

  function set(partial: Partial<PlacesFilters>) {
    onChange({ ...filters, ...partial });
  }

  function reset() {
    onChange(DEFAULT_FILTERS);
  }

  return (
    <div className="space-y-3">

      {/* ── Row 1: Sort pills (horizontal scroll) ── */}
      <div className="relative">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          <div className="flex items-center gap-1 shrink-0 text-muted-foreground mr-0.5">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span className="text-xs font-medium whitespace-nowrap">Ordenar:</span>
          </div>
          {SORT_OPTIONS.map((opt) => {
            const isActive = filters.sort === opt.value;
            return (
              <motion.button
                key={opt.value}
                whileTap={{ scale: 0.93 }}
                onClick={() => set({ sort: opt.value })}
                className={cn(
                  'relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-all shrink-0',
                  isActive
                    ? cn(opt.activeBg, opt.activeText, 'border-transparent shadow-sm')
                    : cn('bg-muted border-border hover:border-border/80 hover:bg-muted/80', opt.color),
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="sort-active-bg"
                    className={cn(
                      'absolute inset-0 rounded-full',
                      opt.activeBg,
                    )}
                    style={{ zIndex: -1 }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className={isActive ? opt.activeText : opt.color}>{opt.icon}</span>
                {opt.shortLabel}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Row 2: Filter toggle + count ── */}
      <div className="flex items-center gap-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
            open || activeCount > 0
              ? 'bg-primary text-primary-foreground border-transparent'
              : 'bg-muted text-muted-foreground border-border hover:bg-muted/80',
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filtros
          {activeCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center text-[10px] font-bold leading-none">
              {activeCount}
            </span>
          )}
          <ChevronDown
            className={cn('w-3 h-3 transition-transform duration-200', open && 'rotate-180')}
          />
        </motion.button>

        {/* Results count */}
        {totalCount != null && filteredCount != null && (
          <motion.p
            key={filteredCount}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-muted-foreground"
          >
            {filteredCount === totalCount
              ? `${totalCount} lugares`
              : `${filteredCount} de ${totalCount}`}
          </motion.p>
        )}

        {/* Reset */}
        <AnimatePresence>
          {activeCount > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, x: -4 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -4 }}
              whileTap={{ scale: 0.9 }}
              onClick={reset}
              className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border transition-all"
            >
              <X className="w-3 h-3" />
              Limpar
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Expandable filter panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-border bg-card p-4 space-y-5">

              {/* Rating */}
              <FilterSection
                label="Avaliação mínima"
                icon={<Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />}
              >
                <Chip
                  active={filters.minRating == null}
                  onClick={() => set({ minRating: null })}
                  activeClass="bg-primary text-primary-foreground border-transparent"
                >
                  Todas
                </Chip>
                {RATING_PRESETS.map((p) => (
                  <Chip
                    key={p.min}
                    active={filters.minRating === p.min}
                    onClick={() => set({ minRating: filters.minRating === p.min ? null : p.min })}
                    activeClass="bg-amber-500 text-white border-transparent"
                  >
                    <Star className="w-3 h-3" fill="currentColor" />
                    {p.label}
                  </Chip>
                ))}
              </FilterSection>

              {/* Price level */}
              <FilterSection
                label="Faixa de preço"
                icon={<DollarSign className="w-3.5 h-3.5 text-emerald-500" />}
              >
                <Chip
                  active={filters.minPrice == null && filters.maxPrice == null}
                  onClick={() => set({ minPrice: null, maxPrice: null })}
                  activeClass="bg-primary text-primary-foreground border-transparent"
                >
                  Todas
                </Chip>
                {[1, 2, 3, 4].map((level) => {
                  const active = filters.minPrice === level && filters.maxPrice === level;
                  return (
                    <Chip
                      key={level}
                      active={active}
                      onClick={() =>
                        active
                          ? set({ minPrice: null, maxPrice: null })
                          : set({ minPrice: level, maxPrice: level })
                      }
                      activeClass="bg-emerald-500 text-white border-transparent"
                    >
                      {PRICE_LABELS[level]}
                    </Chip>
                  );
                })}
                <Chip
                  active={filters.maxPrice === 2 && filters.minPrice == null}
                  onClick={() =>
                    filters.maxPrice === 2 && filters.minPrice == null
                      ? set({ minPrice: null, maxPrice: null })
                      : set({ minPrice: null, maxPrice: 2 })
                  }
                  activeClass="bg-emerald-500 text-white border-transparent"
                >
                  Até $$
                </Chip>
                <Chip
                  active={filters.minPrice === 3 && filters.maxPrice == null}
                  onClick={() =>
                    filters.minPrice === 3 && filters.maxPrice == null
                      ? set({ minPrice: null, maxPrice: null })
                      : set({ minPrice: 3, maxPrice: null })
                  }
                  activeClass="bg-emerald-500 text-white border-transparent"
                >
                  Premium $$$+
                </Chip>
              </FilterSection>

              {/* Open now */}
              <FilterSection
                label="Disponibilidade"
                icon={<Clock className="w-3.5 h-3.5 text-sky-500" />}
              >
                <Chip
                  active={filters.openNow == null}
                  onClick={() => set({ openNow: null })}
                  activeClass="bg-primary text-primary-foreground border-transparent"
                >
                  Qualquer hora
                </Chip>
                <Chip
                  active={filters.openNow === true}
                  onClick={() => set({ openNow: filters.openNow === true ? null : true })}
                  activeClass="bg-sky-500 text-white border-transparent"
                >
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      filters.openNow === true ? 'bg-white' : 'bg-emerald-400',
                    )}
                  />
                  Aberto agora
                </Chip>
              </FilterSection>

              {/* Minimum reviews */}
              <FilterSection
                label="Mínimo de avaliações"
                icon={<MessageSquare className="w-3.5 h-3.5 text-violet-500" />}
              >
                <Chip
                  active={filters.minReviews == null}
                  onClick={() => set({ minReviews: null })}
                  activeClass="bg-primary text-primary-foreground border-transparent"
                >
                  Todos
                </Chip>
                {REVIEWS_PRESETS.map((p) => (
                  <Chip
                    key={p.min}
                    active={filters.minReviews === p.min}
                    onClick={() =>
                      set({ minReviews: filters.minReviews === p.min ? null : p.min })
                    }
                    activeClass="bg-violet-500 text-white border-transparent"
                  >
                    {p.label}
                  </Chip>
                ))}
              </FilterSection>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
