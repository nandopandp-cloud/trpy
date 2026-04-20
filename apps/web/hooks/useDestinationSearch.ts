'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { AutocompleteResult } from '@/lib/integrations/google/places-service';

export interface SearchResult {
  place_id: string;
  /** Texto principal — nome da cidade ou destino */
  main: string;
  /** Texto secundário — país/região */
  secondary: string;
  /** Texto completo para exibição e slug */
  description: string;
  types?: string[];
}

// Cache em memória — persiste entre re-renders no mesmo ciclo de vida da tab.
// Chave: query normalizada. Valor: resultados cacheados.
const CACHE = new Map<string, SearchResult[]>();
const MAX_CACHE_SIZE = 100;

function cacheKey(q: string) {
  return q.toLowerCase().trim();
}

function toSearchResult(r: AutocompleteResult): SearchResult {
  return {
    place_id: r.place_id,
    main: r.structured_formatting.main_text,
    secondary: r.structured_formatting.secondary_text ?? '',
    description: r.description,
    types: r.types,
  };
}

interface UseDestinationSearchOptions {
  debounce?: number;
  minLength?: number;
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
  debounce: debounceMs = 300,
  minLength = 2,
}: UseDestinationSearchOptions = {}): UseDestinationSearchReturn {
  const [query, setQueryRaw] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AbortController — cancela requisições pendentes quando o usuário digita mais
  const abortRef = useRef<AbortController | null>(null);

  // Session token — reutilizado ao longo da sessão de busca para reduzir
  // custo de billing no Google Places (as chamadas do mesmo session token
  // são agrupadas e cobradas como uma única operação de Autocomplete Session).
  const sessionTokenRef = useRef<string>(crypto.randomUUID());

  const fetchSuggestions = useCallback(async (q: string) => {
    const key = cacheKey(q);

    // Hit no cache — resposta imediata, sem loader
    if (CACHE.has(key)) {
      setResults(CACHE.get(key)!);
      setLoading(false);
      return;
    }

    // Cancela request anterior
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q,
        session: sessionTokenRef.current,
      });
      const res = await fetch(`/api/places/autocomplete?${params}`, {
        signal: controller.signal,
      });

      if (!res.ok) throw new Error('search_failed');

      const json: { results: AutocompleteResult[] } = await res.json();
      const mapped = json.results.map(toSearchResult);

      // Escreve no cache com limite de tamanho (LRU simples: deleta a mais antiga)
      if (CACHE.size >= MAX_CACHE_SIZE) {
        CACHE.delete(CACHE.keys().next().value!);
      }
      CACHE.set(key, mapped);

      setResults(mapped);
    } catch (err) {
      if ((err as Error).name === 'AbortError') return; // request cancelado — ignorar
      setError('Não foi possível buscar destinos.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < minLength) {
      setResults([]);
      setLoading(false);
      abortRef.current?.abort();
      return;
    }

    setLoading(true); // feedback imediato antes do debounce
    const timer = setTimeout(() => fetchSuggestions(trimmed), debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs, minLength, fetchSuggestions]);

  // Limpar quando componente desmonta
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
    // Novo session token a cada limpeza
    sessionTokenRef.current = crypto.randomUUID();
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
