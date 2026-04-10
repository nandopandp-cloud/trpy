// ─── Unified Media Engine Types ──────────────────────────────────────────────
//
// All external providers (Unsplash, Pexels, …) normalize to these shapes so
// the rest of the codebase never touches provider-specific response schemas.

export type MediaSource = 'unsplash' | 'pexels';
export type MediaType = 'image' | 'video';

export interface MediaAuthor {
  name: string;
  url?: string;
}

/** Unified media item used across the app. */
export interface MediaItem {
  id: string;
  type: MediaType;
  source: MediaSource;
  /** Full-resolution URL (image) or MP4 stream URL (video). */
  url: string;
  /** Low-res preview / poster used for skeletons & lazy loading. */
  preview: string;
  /** Optional thumbnail (smaller than preview, for grids). */
  thumb?: string;
  /** Width in px, when known. */
  width?: number;
  /** Height in px, when known. */
  height?: number;
  /** Duration in seconds (videos only). */
  duration?: number;
  /** Human-readable location, if the provider exposes it. */
  location?: string;
  /** Tiny base64/hex color used for skeleton placeholders. */
  blurHash?: string;
  author: MediaAuthor;
}

export interface MediaSearchOptions {
  query: string;
  perPage?: number;
  orientation?: 'landscape' | 'portrait' | 'square';
  locale?: string;
}

export interface MediaSearchResult {
  items: MediaItem[];
  source: MediaSource | 'mixed';
  query: string;
  cached: boolean;
}
