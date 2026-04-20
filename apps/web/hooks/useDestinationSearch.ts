'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface SearchResult {
  place_id: string;
  /** Texto principal — nome da cidade ou destino */
  main: string;
  /** Texto secundário — país/região */
  secondary: string;
  /** Texto completo para exibição e slug */
  description: string;
  types?: string[];
  /** Origem do resultado — 'local' indica base in-app (sem custo de API) */
  source?: 'local' | 'google';
}

// ─── Cache com persistência em sessionStorage ────────────────────────────────
// Além do Map em memória, replicamos em sessionStorage para que navegações
// entre páginas (ex. detail → voltar) não refaçam as mesmas requisições.
// TTL curto (30 min) para balancear frescor × economia.

const SS_KEY = 'trpy:search_cache_v2';
const CACHE_TTL_MS = 30 * 60 * 1000;
const MAX_CACHE_SIZE = 150;

interface CacheEntry { results: SearchResult[]; expiresAt: number; }

const memCache = new Map<string, CacheEntry>();

function loadPersistedCache() {
  if (typeof window === 'undefined') return;
  try {
    const raw = sessionStorage.getItem(SS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, CacheEntry>;
    const now = Date.now();
    for (const [k, v] of Object.entries(parsed)) {
      if (v.expiresAt > now) memCache.set(k, v);
    }
  } catch { /* ignore corrupted */ }
}

function persistCache() {
  if (typeof window === 'undefined') return;
  try {
    const obj: Record<string, CacheEntry> = {};
    memCache.forEach((v, k) => { obj[k] = v; });
    sessionStorage.setItem(SS_KEY, JSON.stringify(obj));
  } catch { /* quota / private mode — ignore */ }
}

let cacheLoaded = false;

function cacheKey(q: string, country: string | undefined) {
  return `${q.toLowerCase().trim()}|${country ?? ''}`;
}

function cacheGet(key: string): SearchResult[] | null {
  if (!cacheLoaded) { loadPersistedCache(); cacheLoaded = true; }
  const hit = memCache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    memCache.delete(key);
    return null;
  }
  // LRU: move ao final
  memCache.delete(key);
  memCache.set(key, hit);
  return hit.results;
}

function cacheSet(key: string, results: SearchResult[]) {
  if (memCache.size >= MAX_CACHE_SIZE) {
    const oldest = memCache.keys().next().value;
    if (oldest) memCache.delete(oldest);
  }
  memCache.set(key, { results, expiresAt: Date.now() + CACHE_TTL_MS });
  persistCache();
}

// ─── Tipos da API ────────────────────────────────────────────────────────────

interface ApiResult {
  place_id: string;
  description: string;
  structured_formatting: { main_text: string; secondary_text?: string };
  types?: string[];
  source?: 'local' | 'google';
}

function toSearchResult(r: ApiResult): SearchResult {
  return {
    place_id: r.place_id,
    main: r.structured_formatting.main_text,
    secondary: r.structured_formatting.secondary_text ?? '',
    description: r.description,
    types: r.types,
    source: r.source,
  };
}

// ─── Hook ────────────────────────────────────────────────────────────────────

interface UseDestinationSearchOptions {
  debounce?: number;
  minLength?: number;
  /** Código ISO do país do usuário — usado para priorizar destinos locais */
  country?: string;
}

interface UseDestinationSearchReturn {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  clear: () => void;
  sessionToken: string;
}

export function useDestinationSearch({
  debounce: debounceMs = 350,
  minLength = 3,
  country,
}: UseDestinationSearchOptions = {}): UseDestinationSearchReturn {
  const [query, setQueryRaw] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  // Session token — agrupa chamadas do Google Autocomplete em uma única
  // operação de billing. Trocado ao completar/limpar uma busca.
  const sessionTokenRef = useRef<string>('');
  if (!sessionTokenRef.current && typeof crypto !== 'undefined') {
    sessionTokenRef.current = crypto.randomUUID();
  }

  const fetchSuggestions = useCallback(async (q: string) => {
    const key = cacheKey(q, country);

    const cached = cacheGet(key);
    if (cached) {
      setResults(cached);
      setLoading(false);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ q });
      if (sessionTokenRef.current) params.set('session', sessionTokenRef.current);
      if (country) params.set('country', country);

      const res = await fetch(`/api/places/autocomplete?${params}`, {
        signal: controller.signal,
      });

      if (!res.ok) throw new Error('search_failed');

      const json: { results: ApiResult[] } = await res.json();
      const mapped = json.results.map(toSearchResult);
      cacheSet(key, mapped);
      setResults(mapped);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
      setError('Não foi possível buscar destinos.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [country]);

  // Debounce
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < minLength) {
      setResults([]);
      setLoading(false);
      abortRef.current?.abort();
      return;
    }

    // Se já temos resposta em cache, nem mostra loading
    if (cacheGet(cacheKey(trimmed, country))) {
      setResults(cacheGet(cacheKey(trimmed, country))!);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => fetchSuggestions(trimmed), debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs, minLength, country, fetchSuggestions]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const setQuery = useCallback((q: string) => {
    setQueryRaw(q);
    if (!q.trim()) {
      setResults([]);
      setLoading(false);
      setError(null);
    }
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setQueryRaw('');
    setResults([]);
    setLoading(false);
    setError(null);
    if (typeof crypto !== 'undefined') {
      sessionTokenRef.current = crypto.randomUUID();
    }
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clear,
    sessionToken: sessionTokenRef.current,
  };
}
