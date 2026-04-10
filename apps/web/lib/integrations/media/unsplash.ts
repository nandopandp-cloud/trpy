// ─── Unsplash provider ───────────────────────────────────────────────────────
//
// Images only. Server-side only — API key must never leak to the client.

import type { MediaItem, MediaSearchOptions } from './types';

const BASE_URL = 'https://api.unsplash.com';

function getKey(): string | null {
  return process.env.UNSPLASH_ACCESS_KEY ?? null;
}

interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  blur_hash?: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  links: { html: string };
  user: {
    name: string;
    username: string;
    links: { html: string };
  };
  location?: {
    name?: string | null;
    title?: string | null;
  } | null;
}

interface UnsplashSearchResponse {
  results: UnsplashPhoto[];
}

function normalize(photo: UnsplashPhoto): MediaItem {
  return {
    id: `unsplash:${photo.id}`,
    type: 'image',
    source: 'unsplash',
    url: photo.urls.regular,
    preview: photo.urls.small,
    thumb: photo.urls.thumb,
    width: photo.width,
    height: photo.height,
    blurHash: photo.blur_hash,
    location: photo.location?.name ?? photo.location?.title ?? undefined,
    author: {
      name: photo.user.name,
      url: photo.user.links.html,
    },
  };
}

export async function searchUnsplashImages({
  query,
  perPage = 12,
  orientation = 'landscape',
}: MediaSearchOptions): Promise<MediaItem[]> {
  const key = getKey();
  if (!key) return [];

  const params = new URLSearchParams({
    query,
    per_page: String(Math.min(Math.max(perPage, 1), 30)),
    orientation,
    content_filter: 'high',
  });

  try {
    const res = await fetch(`${BASE_URL}/search/photos?${params}`, {
      headers: {
        Authorization: `Client-ID ${key}`,
        'Accept-Version': 'v1',
      },
      next: { revalidate: 60 * 60 * 12 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as UnsplashSearchResponse;
    return (data.results ?? []).map(normalize);
  } catch {
    return [];
  }
}
