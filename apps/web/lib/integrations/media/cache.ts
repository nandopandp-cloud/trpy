// ─── In-memory TTL cache for media lookups ───────────────────────────────────
//
// Scoped to the Next.js server process. Swapping this for Redis later only
// requires replacing get/set — the MediaService talks to this interface only.
//
// Why not Next's `fetch` revalidate? We fan out to multiple provider calls
// with smart-query expansion; caching the *merged* result avoids re-running
// dedupe/ranking on every request.

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const MAX_ENTRIES = 500;

const store = new Map<string, CacheEntry<unknown>>();

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number = DEFAULT_TTL_MS): void {
  // Simple LRU-ish bound: if we're at capacity, drop the oldest insertion.
  if (store.size >= MAX_ENTRIES) {
    const firstKey = store.keys().next().value;
    if (firstKey) store.delete(firstKey);
  }
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function cacheKey(namespace: string, parts: Record<string, string | number | undefined>): string {
  const normalized = Object.entries(parts)
    .filter(([, v]) => v !== undefined && v !== '')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${String(v).toLowerCase().trim()}`)
    .join('&');
  return `${namespace}:${normalized}`;
}
