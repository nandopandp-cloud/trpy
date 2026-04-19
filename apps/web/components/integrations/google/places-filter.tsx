'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal, Star, DollarSign, Clock, X,
  ChevronDown, MessageSquare,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { PlaceSearchResult } from '@/lib/integrations/google/places-service';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlacesFilters {
  minRating: number | null;
  maxRating: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  openNow: boolean | null;
  minReviews: number | null;
}

export const DEFAULT_FILTERS: PlacesFilters = {
  minRating: null,
  maxRating: null,
  minPrice: null,
  maxPrice: null,
  openNow: null,
  minReviews: null,
};

export function countActiveFilters(f: PlacesFilters): number {
  let n = 0;
  if (f.minRating != null) n++;
  if (f.maxRating != null) n++;
  if (f.minPrice != null || f.maxPrice != null) n++;
  if (f.openNow != null) n++;
  if (f.minReviews != null) n++;
  return n;
}

// ─── Filter application ───────────────────────────────────────────────────────

export function applyFilters(
  places: PlaceSearchResult[],
  filters: PlacesFilters | null | undefined,
): PlaceSearchResult[] {
  if (!Array.isArray(places)) return [];
  if (!filters) return [...places];

  let result = [...places];

  // Filtros inclusivos: quando o Google não retorna o campo (rating, price_level,
  // opening_hours), não excluímos o lugar — preservamos diversidade e evitamos
  // resultados vazios por falta de metadados.
  if (filters.minRating != null)
    result = result.filter((p) => p.rating == null || p.rating >= filters.minRating!);
  if (filters.maxRating != null)
    result = result.filter((p) => p.rating == null || p.rating <= filters.maxRating!);
  if (filters.minPrice != null)
    result = result.filter((p) => p.price_level == null || p.price_level >= filters.minPrice!);
  if (filters.maxPrice != null)
    result = result.filter((p) => p.price_level == null || p.price_level <= filters.maxPrice!);
  if (filters.openNow === true)
    result = result.filter((p) => p.opening_hours?.open_now !== false);
  if (filters.minReviews != null)
    result = result.filter(
      (p) => p.user_ratings_total == null || p.user_ratings_total >= filters.minReviews!,
    );

  return result;
}

// ─── Presets ──────────────────────────────────────────────────────────────────

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

const PRICE_LABELS = ['', '$', '$$', '$$$', '$$$$'];

// ─── Chip ─────────────────────────────────────────────────────────────────────

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
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
        active
          ? activeClass
          : 'bg-muted text-muted-foreground border-border hover:bg-muted/80 hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

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

  function set(partial: Partial<PlacesFilters>) {
    onChange({ ...filters, ...partial });
  }

  function reset() {
    onChange({ ...DEFAULT_FILTERS });
    setOpen(false);
  }

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <button
          type="button"
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
        </button>

        {totalCount != null && filteredCount != null && (
          <p className="text-xs text-muted-foreground">
            {filteredCount === totalCount
              ? `${totalCount} lugares`
              : `${filteredCount} de ${totalCount}`}
          </p>
        )}

        {activeCount > 0 && (
          <button
            type="button"
            onClick={reset}
            className="ml-auto flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border transition-all"
          >
            <X className="w-3 h-3" />
            Limpar
          </button>
        )}
      </div>

      {/* Expandable panel */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="filter-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
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
                >
                  Qualquer hora
                </Chip>
                <Chip
                  active={filters.openNow === true}
                  onClick={() => set({ openNow: filters.openNow === true ? null : true })}
                  activeClass="bg-sky-500 text-white border-transparent"
                >
                  <span className={cn('w-1.5 h-1.5 rounded-full', filters.openNow === true ? 'bg-white' : 'bg-emerald-400')} />
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
