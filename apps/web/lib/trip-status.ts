/**
 * Single source of truth for trip status derivation and badge styling.
 *
 * The DB status field reflects user intent (CANCELLED) but the *displayed*
 * status must be derived from the actual trip dates. This module handles that.
 */

export type EffectiveStatus = 'PLANNING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

interface TripLike {
  status: string;
  startDate: string | Date;
  endDate: string | Date;
}

/** Derive the status the UI should display, based on real dates. */
export function deriveStatus(trip: TripLike): EffectiveStatus {
  if (trip.status === 'CANCELLED') return 'CANCELLED';
  const now = new Date();
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  if (now > end) return 'COMPLETED';
  if (now >= start) return 'ONGOING';
  return 'PLANNING';
}

/* ── Labels ─────────────────────────────────────────────────────────────────── */

export const STATUS_LABEL: Record<EffectiveStatus, string> = {
  PLANNING:  'Planejando',
  ONGOING:   'Em andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelada',
};

/* ── Solid badge styles (opaque backgrounds for readability) ─────────────────── */

/**
 * Use on light backgrounds (cards, lists, modals).
 * Solid tinted backgrounds so the badge is always readable.
 */
export const STATUS_BADGE_LIGHT: Record<EffectiveStatus, string> = {
  PLANNING:  'bg-amber-100 text-amber-700 border-amber-200',
  ONGOING:   'bg-emerald-100 text-emerald-700 border-emerald-200',
  COMPLETED: 'bg-zinc-200 text-zinc-600 border-zinc-300',
  CANCELLED: 'bg-red-100 text-red-600 border-red-200',
};

/**
 * Use on dark/image backgrounds (hero covers, hero cards).
 * Solid dark-tinted backgrounds so the badge contrasts against photos.
 */
export const STATUS_BADGE_DARK: Record<EffectiveStatus, string> = {
  PLANNING:  'bg-amber-500/80 text-white border-amber-400/50',
  ONGOING:   'bg-emerald-500/80 text-white border-emerald-400/50',
  COMPLETED: 'bg-zinc-600/80 text-white border-zinc-500/50',
  CANCELLED: 'bg-red-500/80 text-white border-red-400/50',
};

/** Dot color for animated pulse (ONGOING only). */
export const STATUS_DOT_COLOR: Record<EffectiveStatus, string> = {
  PLANNING:  'bg-amber-400',
  ONGOING:   'bg-emerald-400',
  COMPLETED: 'bg-zinc-400',
  CANCELLED: 'bg-red-400',
};
