// ─── Pexels provider ─────────────────────────────────────────────────────────
//
// Images + videos. Server-side only.

import type { MediaItem, MediaSearchOptions } from './types';

const IMAGE_URL = 'https://api.pexels.com/v1/search';
const VIDEO_URL = 'https://api.pexels.com/videos/search';

function getKey(): string | null {
  return process.env.PEXELS_API_KEY ?? null;
}

// ─── Images ──────────────────────────────────────────────────────────────────

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  avg_color?: string;
  alt?: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
}

interface PexelsImageResponse {
  photos: PexelsPhoto[];
}

function normalizePhoto(p: PexelsPhoto): MediaItem {
  return {
    id: `pexels-img:${p.id}`,
    type: 'image',
    source: 'pexels',
    url: p.src.large2x ?? p.src.large,
    preview: p.src.medium,
    thumb: p.src.tiny,
    width: p.width,
    height: p.height,
    blurHash: p.avg_color,
    location: p.alt,
    author: {
      name: p.photographer,
      url: p.photographer_url,
    },
  };
}

export async function searchPexelsImages({
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
  });

  try {
    const res = await fetch(`${IMAGE_URL}?${params}`, {
      headers: { Authorization: key },
      next: { revalidate: 60 * 60 * 12 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as PexelsImageResponse;
    return (data.photos ?? []).map(normalizePhoto);
  } catch {
    return [];
  }
}

// ─── Videos ──────────────────────────────────────────────────────────────────

interface PexelsVideoFile {
  id: number;
  quality: 'hd' | 'sd' | 'uhd' | string;
  file_type: string;
  width: number | null;
  height: number | null;
  link: string;
}

interface PexelsVideoPicture {
  id: number;
  picture: string;
  nr: number;
}

interface PexelsVideo {
  id: number;
  width: number;
  height: number;
  duration: number;
  url: string;
  image: string;
  user: { name: string; url: string };
  video_files: PexelsVideoFile[];
  video_pictures: PexelsVideoPicture[];
}

interface PexelsVideoResponse {
  videos: PexelsVideo[];
}

function pickBestVideoFile(files: PexelsVideoFile[]): PexelsVideoFile | null {
  if (files.length === 0) return null;
  // Prefer HD mp4 under ~1080p for browser compatibility and bandwidth.
  const mp4 = files.filter((f) => f.file_type === 'video/mp4');
  const hd = mp4.find((f) => f.quality === 'hd' && (f.height ?? 0) <= 1080);
  if (hd) return hd;
  const sd = mp4.find((f) => f.quality === 'sd');
  if (sd) return sd;
  return mp4[0] ?? files[0] ?? null;
}

function normalizeVideo(v: PexelsVideo): MediaItem | null {
  const file = pickBestVideoFile(v.video_files);
  if (!file) return null;
  return {
    id: `pexels-vid:${v.id}`,
    type: 'video',
    source: 'pexels',
    url: file.link,
    preview: v.image,
    thumb: v.video_pictures[0]?.picture ?? v.image,
    width: v.width,
    height: v.height,
    duration: v.duration,
    author: {
      name: v.user.name,
      url: v.user.url,
    },
  };
}

export async function searchPexelsVideos({
  query,
  perPage = 10,
  orientation = 'landscape',
}: MediaSearchOptions): Promise<MediaItem[]> {
  const key = getKey();
  if (!key) return [];

  const params = new URLSearchParams({
    query,
    per_page: String(Math.min(Math.max(perPage, 1), 20)),
    orientation,
  });

  try {
    const res = await fetch(`${VIDEO_URL}?${params}`, {
      headers: { Authorization: key },
      next: { revalidate: 60 * 60 * 12 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as PexelsVideoResponse;
    return (data.videos ?? [])
      .map(normalizeVideo)
      .filter((x): x is MediaItem => x !== null);
  } catch {
    return [];
  }
}
