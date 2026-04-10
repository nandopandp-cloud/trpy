// ─── Media Service ───────────────────────────────────────────────────────────
//
// The only module the rest of the app should talk to. Orchestrates:
//   • smart query expansion
//   • parallel fan-out to providers
//   • merge / dedupe / rank
//   • 24h in-memory cache
//
// If we later add a provider (e.g. Pixabay, Google Places Photos), it plugs
// in here without any API route or component changes.

import type {
  MediaItem,
  MediaSearchOptions,
  MediaSearchResult,
} from './types';
import { cacheGet, cacheSet, cacheKey } from './cache';
import { buildImageQueries, buildVideoQueries } from './query-builder';
import { searchUnsplashImages } from './unsplash';
import { searchPexelsImages, searchPexelsVideos } from './pexels';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dedupe(items: MediaItem[]): MediaItem[] {
  const seen = new Set<string>();
  const out: MediaItem[] = [];
  for (const item of items) {
    // id already encodes source, so collisions only happen on exact dups.
    if (seen.has(item.id)) continue;
    // Also guard against same URL across providers (rare).
    if (seen.has(item.url)) continue;
    seen.add(item.id);
    seen.add(item.url);
    out.push(item);
  }
  return out;
}

/** Interleave lists so the first page mixes sources, not Unsplash-then-Pexels. */
function interleave<T>(lists: T[][]): T[] {
  const out: T[] = [];
  const max = Math.max(...lists.map((l) => l.length), 0);
  for (let i = 0; i < max; i++) {
    for (const list of lists) {
      if (i < list.length) out.push(list[i]);
    }
  }
  return out;
}

async function settledAll<T>(promises: Array<Promise<T[]>>): Promise<T[][]> {
  const results = await Promise.allSettled(promises);
  return results.map((r) => (r.status === 'fulfilled' ? r.value : []));
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function searchImages(
  opts: MediaSearchOptions,
): Promise<MediaSearchResult> {
  const { query, perPage = 12, orientation = 'landscape', locale } = opts;

  const key = cacheKey('media:images', { query, perPage, orientation, locale });
  const cached = cacheGet<MediaSearchResult>(key);
  if (cached) return { ...cached, cached: true };

  // Smart-query expansion: primary gets full per-page quota, secondary queries
  // use a smaller quota just for variety.
  const [primary, ...secondaries] = buildImageQueries(query);
  const secondaryPerPage = Math.max(4, Math.ceil(perPage / 2));

  const primaryCalls: Array<Promise<MediaItem[]>> = [
    searchUnsplashImages({ query: primary, perPage, orientation }),
    searchPexelsImages({ query: primary, perPage, orientation }),
  ];

  const secondaryCalls: Array<Promise<MediaItem[]>> = secondaries
    .slice(0, 2) // keep fan-out bounded
    .flatMap((q) => [
      searchUnsplashImages({ query: q, perPage: secondaryPerPage, orientation }),
      searchPexelsImages({ query: q, perPage: secondaryPerPage, orientation }),
    ]);

  const [primaryResults, secondaryResults] = await Promise.all([
    settledAll(primaryCalls),
    settledAll(secondaryCalls),
  ]);

  // Interleave primary results (mixes Unsplash + Pexels in the top-of-feed),
  // then append secondary results for variety.
  const merged = [
    ...interleave(primaryResults),
    ...interleave(secondaryResults),
  ];
  const items = dedupe(merged).slice(0, perPage * 2);

  const result: MediaSearchResult = {
    items,
    source: 'mixed',
    query,
    cached: false,
  };

  // Only cache non-empty results so transient provider failures can retry.
  if (items.length > 0) cacheSet(key, result);

  return result;
}

export async function searchVideos(
  opts: MediaSearchOptions,
): Promise<MediaSearchResult> {
  const { query, perPage = 10, orientation = 'landscape', locale } = opts;

  const key = cacheKey('media:videos', { query, perPage, orientation, locale });
  const cached = cacheGet<MediaSearchResult>(key);
  if (cached) return { ...cached, cached: true };

  const [primary, ...secondaries] = buildVideoQueries(query);
  const secondaryPerPage = Math.max(3, Math.ceil(perPage / 2));

  const calls: Array<Promise<MediaItem[]>> = [
    searchPexelsVideos({ query: primary, perPage, orientation }),
    ...secondaries
      .slice(0, 2)
      .map((q) =>
        searchPexelsVideos({ query: q, perPage: secondaryPerPage, orientation }),
      ),
  ];

  const lists = await settledAll(calls);
  const items = dedupe(lists.flat()).slice(0, perPage * 2);

  const result: MediaSearchResult = {
    items,
    source: 'pexels',
    query,
    cached: false,
  };

  if (items.length > 0) cacheSet(key, result);

  return result;
}

/**
 * Picks the single best cover image for a destination.
 * Used by the trip auto-enrichment pipeline.
 *
 * Ranking preference (highest → lowest):
 *   1. Unsplash landscape (curated editorial quality)
 *   2. Pexels landscape
 *   3. First available result
 */
export async function getBestCoverImage(
  destination: string,
): Promise<string | null> {
  if (!destination.trim()) return null;

  try {
    const { items } = await searchImages({
      query: destination,
      perPage: 10,
      orientation: 'landscape',
    });

    if (items.length === 0) return null;

    const unsplashLandscape = items.find(
      (i) =>
        i.source === 'unsplash' &&
        i.width !== undefined &&
        i.height !== undefined &&
        i.width > i.height,
    );
    if (unsplashLandscape) return unsplashLandscape.url;

    const pexelsLandscape = items.find(
      (i) =>
        i.source === 'pexels' &&
        i.width !== undefined &&
        i.height !== undefined &&
        i.width > i.height,
    );
    if (pexelsLandscape) return pexelsLandscape.url;

    return items[0].url;
  } catch (error) {
    console.error('[getBestCoverImage]', error);
    return null;
  }
}
