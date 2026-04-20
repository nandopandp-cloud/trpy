export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { autocomplete, type AutocompleteResult } from '@/lib/integrations/google/places-service';
import { searchLocal, type LocalDestination } from '@/lib/search/local-destinations';

/**
 * GET /api/places/autocomplete?q=paris&session=<token>&country=<ISO>
 *
 * Estratégia híbrida para reduzir custo da Google Places API:
 *   1. Busca local (0 custo, ~0.1ms) — ~250 destinos globais pré-indexados.
 *      Cobre a maioria das queries reais (Paris, Bali, Rio, Lisboa…).
 *   2. Se a busca local retornar ≥3 resultados com score alto, NÃO chama Google.
 *   3. Caso contrário, consulta Google Places e combina os resultados locais
 *      (priorizados) com os remotos, deduplicando por nome normalizado.
 *
 * Cache:
 *   - Edge: s-maxage={{ttl}} — compartilhado entre todos os usuários.
 *   - Server-side LRU: atua em cold-starts e reduz requests mesmo quando
 *     o edge cache ainda não aqueceu.
 *
 * Parâmetros:
 *   q         — texto digitado (mínimo 3 caracteres)
 *   session   — session token (reduz billing do Google Autocomplete)
 *   country   — ISO 3166-1 alpha-2 do usuário (para boost local)
 *
 * Resposta:
 *   { results: SearchResult[] }  (mínimo, otimizado para payload pequeno)
 */

interface SearchPayload {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
  /** Origem do resultado — útil para telemetria e lógica no cliente */
  source: 'local' | 'google';
}

// ─── Cache server-side persistente (LRU simples) ─────────────────────────────
// Vive durante a lifetime do processo Node/serverless container. Dá hit cross-
// usuário em chaves populares, complementando o edge cache do Vercel.

const MAX_CACHE = 500;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h
const serverCache = new Map<string, { payload: SearchPayload[]; expiresAt: number }>();

function cacheGet(key: string): SearchPayload[] | null {
  const hit = serverCache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    serverCache.delete(key);
    return null;
  }
  // Promove para o final (LRU)
  serverCache.delete(key);
  serverCache.set(key, hit);
  return hit.payload;
}

function cacheSet(key: string, payload: SearchPayload[]) {
  if (serverCache.size >= MAX_CACHE) {
    const oldest = serverCache.keys().next().value;
    if (oldest) serverCache.delete(oldest);
  }
  serverCache.set(key, { payload, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ─── Conversores ─────────────────────────────────────────────────────────────

function localToPayload(d: LocalDestination): SearchPayload {
  return {
    place_id: d.place_id,
    description: d.description,
    structured_formatting: {
      main_text: d.main,
      secondary_text: d.secondary,
    },
    types: d.types,
    source: 'local',
  };
}

function googleToPayload(r: AutocompleteResult): SearchPayload {
  return {
    place_id: r.place_id,
    description: r.description,
    structured_formatting: {
      main_text: r.structured_formatting.main_text,
      secondary_text: r.structured_formatting.secondary_text ?? '',
    },
    types: r.types ?? [],
    source: 'google',
  };
}

function dedupeByName(items: SearchPayload[]): SearchPayload[] {
  const seen = new Set<string>();
  const out: SearchPayload[] = [];
  for (const item of items) {
    const key = item.structured_formatting.main_text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

// ─── Handler ─────────────────────────────────────────────────────────────────

const MIN_LENGTH = 3;
const MAX_RESULTS = 6;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim() ?? '';
  const session = req.nextUrl.searchParams.get('session') ?? undefined;
  const country = req.nextUrl.searchParams.get('country') ?? undefined;

  if (q.length < MIN_LENGTH) {
    return NextResponse.json(
      { results: [] },
      { headers: { 'Cache-Control': 'public, s-maxage=3600' } },
    );
  }

  const cacheKey = `${q.toLowerCase()}|${country ?? ''}`;

  // 1) Server cache — hit curto-circuita tudo
  const cached = cacheGet(cacheKey);
  if (cached) {
    return NextResponse.json(
      { results: cached },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' } },
    );
  }

  // 2) Busca local
  const localHits = searchLocal(q, { limit: MAX_RESULTS, userCountry: country });
  const localPayload = localHits.map(localToPayload);

  // Threshold: se tivermos ≥3 hits locais com score alto (prefix match) para uma
  // query curta (≤5 chars), não chama Google. Queries mais longas tendem a ser
  // específicas (atrações, restaurantes) — aí vale consultar o Google.
  const hasStrongLocalHit =
    localHits.length >= 3 && q.length <= 5 &&
    localHits.slice(0, 3).every((h) => {
      const n = h.main.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const qn = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return n.startsWith(qn);
    });

  if (hasStrongLocalHit) {
    const payload = localPayload.slice(0, MAX_RESULTS);
    cacheSet(cacheKey, payload);
    return NextResponse.json(
      { results: payload },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' } },
    );
  }

  // 3) Fallback Google Places
  try {
    const googleResults = await autocomplete(q, session);
    const googlePayload = googleResults.map(googleToPayload);

    const combined = dedupeByName([...localPayload, ...googlePayload]).slice(0, MAX_RESULTS);
    cacheSet(cacheKey, combined);

    // TTL do edge cache escala com a especificidade da query:
    // queries curtas (1-3 chars) mudam rápido (autocomplete volátil)
    // queries longas são estáveis (nome completo de destino)
    const ttl = q.length <= 4 ? 3600 : 86400;
    return NextResponse.json(
      { results: combined },
      { headers: { 'Cache-Control': `public, s-maxage=${ttl}, stale-while-revalidate=${Math.min(ttl, 3600)}` } },
    );
  } catch {
    // Em caso de falha do Google, devolvemos pelo menos o que achamos local
    const payload = localPayload.slice(0, MAX_RESULTS);
    if (payload.length > 0) cacheSet(cacheKey, payload);
    return NextResponse.json(
      { results: payload },
      { headers: { 'Cache-Control': 'public, s-maxage=60' } },
    );
  }
}
