'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Star, DollarSign, Clock, ArrowUpDown, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SortOption = 'relevance' | 'rating_desc' | 'rating_asc' | 'reviews_desc' | 'price_asc' | 'price_desc';

export interface PlacesFilters {
  minRating: number | null;       // 0–5, null = any
  maxRating: number | null;
  minPrice: number | null;        // 1–4 ($ to $$$$), null = any
  maxPrice: number | null;
  openNow: boolean | null;        // true = only open, null = any
  minReviews: number | null;      // minimum review count, null = any
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

import type { PlaceSearchResult } from '@/lib/integrations/google/places-service';

export function applyFilters(places: PlaceSearchResult[], filters: PlacesFilters): PlaceSearchResult[] {
  let result = [...places];

  if (filters.minRating != null) {
    result = result.filter((p) => p.rating != null && p.rating >= filters.minRating!);
  }
  if (filters.maxRating != null) {
    result = result.filter((p) => p.rating != null && p.rating <= filters.maxRating!);
  }
  if (filters.minPrice != null) {
    result = result.filter((p) => p.price_level != null && p.price_level >= filters.minPrice!);
  }
  if (filters.maxPrice != null) {
    result = result.filter((p) => p.price_level != null && p.price_level <= filters.maxPrice!);
  }
  if (filters.openNow === true) {
    result = result.filter((p) => p.opening_hours?.open_now === true);
  }
  if (filters.minReviews != null) {
    result = result.filter((p) => p.user_ratings_total != null && p.user_ratings_total >= filters.minReviews!);
  }

  // Sort
  switch (filters.sort) {
    case 'rating_desc':
      result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      break;
    case 'rating_asc':
      result.sort((a, b) => (a.rating ?? 0) - (b.rating ?? 0));
      break;
    case 'reviews_desc':
      result.sort((a, b) => (b.user_ratings_total ?? 0) - (a.user_ratings_total ?? 0));
      break;
    case 'price_asc':
      result.sort((a, b) => (a.price_level ?? 0) - (b.price_level ?? 0));
      break;
    case 'price_desc':
      result.sort((a, b) => (b.price_level ?? 0) - (a.price_level ?? 0));
      break;
    default:
      break; // relevance = original order
  }

  return result;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface PlacesFilterProps {
  filters: PlacesFilters;
  onChange: (f: PlacesFilters) => void;
  totalCount?: number;
  filteredCount?: number;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'relevance',    label: 'Relevância' },
  { value: 'rating_desc',  label: 'Melhor avaliação' },
  { value: 'rating_asc',   label: 'Menor avaliação' },
  { value: 'reviews_desc', label: 'Mais avaliado' },
  { value: 'price_asc',    label: 'Menor preço' },
  { value: 'price_desc',   label: 'Maior preço' },
];

const PRICE_LABELS = ['', '$', '$$', '$$$', '$$$$'];

const RATING_PRESETS = [
  { label: '4.5+', min: 4.5 },
  { label: '4.0+', min: 4.0 },
  { label: '3.5+', min: 3.5 },
  { label: '3.0+', min: 3.0 },
];

const REVIEWS_PRESETS = [
  { label: '100+', min: 100 },
  { label: '500+', min: 500 },
  { label: '1k+',  min: 1000 },
  { label: '5k+',  min: 5000 },
];

export function PlacesFilter({ filters, onChange, totalCount, filteredCount }: PlacesFilterProps) {
  const [open, setOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  function set(partial: Partial<PlacesFilters>) {
    onChange({ ...filters, ...partial });
  }

  function reset() {
    onChange(DEFAULT_FILTERS);
  }

  return (
    <div className="space-y-2">
      {/* Toolbar row */}
      <div className="flex items-center gap-2">
        {/* Filter toggle button */}
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
            <span className="w-4 h-4 rounded-full bg-white/25 flex items-center justify-center text-[10px] font-bold">
              {activeCount}
            </span>
          )}
          <ChevronDown className={cn('w-3 h-3 transition-transform', open && 'rotate-180')} />
        </motion.button>

        {/* Sort quick select */}
        <div className="relative flex-1 min-w-0">
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-muted border border-border text-xs text-muted-foreground">
            <ArrowUpDown className="w-3 h-3 shrink-0" />
            <select
              value={filters.sort}
              onChange={(e) => set({ sort: e.target.value as SortOption })}
              className="bg-transparent outline-none text-xs text-foreground font-medium cursor-pointer flex-1 min-w-0"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Reset */}
        {activeCount > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileTap={{ scale: 0.9 }}
            onClick={reset}
            className="flex items-center gap-1 px-2 py-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-3 h-3" />
            Limpar
          </motion.button>
        )}
      </div>

      {/* Results count */}
      {(totalCount != null && filteredCount != null) && (
        <p className="text-xs text-muted-foreground px-0.5">
          {filteredCount === totalCount
            ? `${totalCount} lugares encontrados`
            : `${filteredCount} de ${totalCount} lugares`}
        </p>
      )}

      {/* Expandable filter panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-border bg-card p-4 space-y-5">

              {/* Rating */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
                  <span className="text-xs font-semibold text-foreground">Avaliação mínima</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => set({ minRating: null })}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                      filters.minRating == null
                        ? 'bg-primary text-primary-foreground border-transparent'
                        : 'bg-muted text-muted-foreground border-border hover:bg-muted/80',
                    )}
                  >
                    Todas
                  </button>
                  {RATING_PRESETS.map((p) => (
                    <button
                      key={p.min}
                      onClick={() => set({ minRating: filters.minRating === p.min ? null : p.min })}
                      className={cn(
                        'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                        filters.minRating === p.min
                          ? 'bg-amber-500 text-white border-transparent'
                          : 'bg-muted text-muted-foreground border-border hover:bg-amber-500/10 hover:border-amber-400/40',
                      )}
                    >
                      <Star className="w-3 h-3" fill="currentColor" />
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price level */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-semibold text-foreground">Faixa de preço</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => set({ minPrice: null, maxPrice: null })}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                      filters.minPrice == null && filters.maxPrice == null
                        ? 'bg-primary text-primary-foreground border-transparent'
                        : 'bg-muted text-muted-foreground border-border hover:bg-muted/80',
                    )}
                  >
                    Todas
                  </button>
                  {[1, 2, 3, 4].map((level) => {
                    const active = filters.minPrice === level && filters.maxPrice === level;
                    return (
                      <button
                        key={level}
                        onClick={() =>
                          active
                            ? set({ minPrice: null, maxPrice: null })
                            : set({ minPrice: level, maxPrice: level })
                        }
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                          active
                            ? 'bg-emerald-500 text-white border-transparent'
                            : 'bg-muted text-muted-foreground border-border hover:bg-emerald-500/10 hover:border-emerald-400/40',
                        )}
                      >
                        {PRICE_LABELS[level]}
                      </button>
                    );
                  })}
                  {/* Budget range: up to $$ */}
                  <button
                    onClick={() =>
                      filters.maxPrice === 2 && filters.minPrice == null
                        ? set({ minPrice: null, maxPrice: null })
                        : set({ minPrice: null, maxPrice: 2 })
                    }
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                      filters.maxPrice === 2 && filters.minPrice == null
                        ? 'bg-emerald-500 text-white border-transparent'
                        : 'bg-muted text-muted-foreground border-border hover:bg-emerald-500/10 hover:border-emerald-400/40',
                    )}
                  >
                    Até $$
                  </button>
                  {/* Premium: $$$ and $$$$ */}
                  <button
                    onClick={() =>
                      filters.minPrice === 3 && filters.maxPrice == null
                        ? set({ minPrice: null, maxPrice: null })
                        : set({ minPrice: 3, maxPrice: null })
                    }
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                      filters.minPrice === 3 && filters.maxPrice == null
                        ? 'bg-emerald-500 text-white border-transparent'
                        : 'bg-muted text-muted-foreground border-border hover:bg-emerald-500/10 hover:border-emerald-400/40',
                    )}
                  >
                    Premium $$$+
                  </button>
                </div>
              </div>

              {/* Open now */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-500" />
                  <span className="text-xs font-semibold text-foreground">Disponibilidade</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => set({ openNow: null })}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                      filters.openNow == null
                        ? 'bg-primary text-primary-foreground border-transparent'
                        : 'bg-muted text-muted-foreground border-border hover:bg-muted/80',
                    )}
                  >
                    Qualquer hora
                  </button>
                  <button
                    onClick={() => set({ openNow: filters.openNow === true ? null : true })}
                    className={cn(
                      'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                      filters.openNow === true
                        ? 'bg-sky-500 text-white border-transparent'
                        : 'bg-muted text-muted-foreground border-border hover:bg-sky-500/10 hover:border-sky-400/40',
                    )}
                  >
                    <span className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      filters.openNow === true ? 'bg-white' : 'bg-emerald-400',
                    )} />
                    Aberto agora
                  </button>
                </div>
              </div>

              {/* Minimum reviews */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">💬</span>
                  <span className="text-xs font-semibold text-foreground">Mínimo de avaliações</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => set({ minReviews: null })}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                      filters.minReviews == null
                        ? 'bg-primary text-primary-foreground border-transparent'
                        : 'bg-muted text-muted-foreground border-border hover:bg-muted/80',
                    )}
                  >
                    Todos
                  </button>
                  {REVIEWS_PRESETS.map((p) => (
                    <button
                      key={p.min}
                      onClick={() => set({ minReviews: filters.minReviews === p.min ? null : p.min })}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                        filters.minReviews === p.min
                          ? 'bg-violet-500 text-white border-transparent'
                          : 'bg-muted text-muted-foreground border-border hover:bg-violet-500/10 hover:border-violet-400/40',
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
