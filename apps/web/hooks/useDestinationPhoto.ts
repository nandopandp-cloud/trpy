'use client';

import { useQuery } from '@tanstack/react-query';

/**
 * Fetches the best single photo for a destination/category query.
 *
 * Priority: Unsplash → Pexels (handled server-side by the media engine).
 * Result is cached by React Query for 1h on the client; backend caches 24h.
 *
 * Returns `null` while loading and when no image is found.
 */
export function useDestinationPhoto(query: string | null | undefined): string | null {
  const { data } = useQuery<string | null>({
    queryKey: ['destination-photo', query?.toLowerCase().trim()],
    queryFn: async () => {
      if (!query?.trim()) return null;
      const params = new URLSearchParams({ query, perPage: '5', orientation: 'landscape' });
      const res = await fetch(`/api/media/images?${params}`);
      const json = await res.json();
      if (!json.success || !json.data?.items?.length) return null;

      // Prefer Unsplash, fall back to Pexels
      const items: Array<{ source: string; url: string; width?: number; height?: number }> =
        json.data.items;

      const unsplash = items.find(
        (i) => i.source === 'unsplash' && (i.width ?? 1) >= (i.height ?? 1),
      );
      if (unsplash) return unsplash.url;

      const pexels = items.find(
        (i) => i.source === 'pexels' && (i.width ?? 1) >= (i.height ?? 1),
      );
      if (pexels) return pexels.url;

      return items[0]?.url ?? null;
    },
    enabled: !!query?.trim(),
    staleTime: 60 * 60 * 1000, // 1h — backend already caches 24h
    gcTime: 2 * 60 * 60 * 1000,
    retry: 1,
    // Don't replace on refetch to avoid image flicker
    placeholderData: (prev) => prev,
  });

  return data ?? null;
}
