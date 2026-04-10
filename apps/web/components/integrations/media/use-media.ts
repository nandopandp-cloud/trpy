'use client';

import { useQuery } from '@tanstack/react-query';
import type { MediaItem, MediaSearchResult } from '@/lib/integrations/media';

interface UseMediaOptions {
  query: string | undefined | null;
  perPage?: number;
  orientation?: 'landscape' | 'portrait' | 'square';
  /** Pass false to temporarily disable the query. */
  enabled?: boolean;
}

async function fetchMedia(
  path: 'images' | 'videos',
  params: URLSearchParams,
): Promise<MediaSearchResult> {
  const res = await fetch(`/api/media/${path}?${params.toString()}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error ?? 'Erro ao buscar mídia');
  return json.data as MediaSearchResult;
}

function buildParams(opts: UseMediaOptions): URLSearchParams {
  const params = new URLSearchParams();
  if (opts.query) params.set('query', opts.query);
  if (opts.perPage) params.set('perPage', String(opts.perPage));
  if (opts.orientation) params.set('orientation', opts.orientation);
  return params;
}

/** React Query hook for fetching images from the unified media engine. */
export function useMediaImages(opts: UseMediaOptions) {
  const enabled = (opts.enabled ?? true) && !!opts.query?.trim();
  return useQuery<MediaSearchResult>({
    queryKey: ['media', 'images', opts.query, opts.perPage, opts.orientation],
    queryFn: () => fetchMedia('images', buildParams(opts)),
    enabled,
    staleTime: 60 * 60 * 1000, // 1h — backend already caches 24h
    gcTime: 2 * 60 * 60 * 1000,
    retry: 1,
  });
}

/** React Query hook for fetching videos from the unified media engine. */
export function useMediaVideos(opts: UseMediaOptions) {
  const enabled = (opts.enabled ?? true) && !!opts.query?.trim();
  return useQuery<MediaSearchResult>({
    queryKey: ['media', 'videos', opts.query, opts.perPage, opts.orientation],
    queryFn: () => fetchMedia('videos', buildParams(opts)),
    enabled,
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    retry: 1,
  });
}

export type { MediaItem, MediaSearchResult };
