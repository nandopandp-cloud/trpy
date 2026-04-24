export interface PlacePhoto {
  photo_reference: string;
  height: number;
  width: number;
}

export interface PlaceReview {
  author_name: string;
  author_url?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  types?: string[];
  geometry?: {
    location: { lat: number; lng: number };
  };
  photos?: PlacePhoto[];
  reviews?: PlaceReview[];
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  url?: string;
}

export interface PlaceSearchResult {
  place_id: string;
  name: string;
  formatted_address?: string;
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  geometry?: {
    location: { lat: number; lng: number };
  };
  photos?: PlacePhoto[];
  price_level?: number;
  opening_hours?: { open_now?: boolean };
}

export interface AutocompleteResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text?: string;
  };
  types?: string[];
}

import { withGoogleGuard } from './cost-guard';
import { prisma } from '@/lib/prisma';

const BASE_URL = 'https://maps.googleapis.com/maps/api';

// Cache de Place Details em DB com TTL de 30 dias. Sobrevive a redeploy/cold-start
// (diferente do edge cache do Next que volta a 0). Evita re-cobrança quando o mesmo
// place é aberto por outro usuário ou device.
const PLACE_CACHE_TTL_DAYS = 30;

async function readPlaceCache(placeId: string, tier: PlaceDetailsTier): Promise<PlaceDetails | null> {
  try {
    const row = await prisma.placeCache.findUnique({
      where: { placeId_tier: { placeId, tier } },
    });
    if (!row) return null;
    if (row.expiresAt.getTime() <= Date.now()) return null;
    return row.payload as unknown as PlaceDetails;
  } catch {
    // Tabela pode não existir ainda (migração pendente). Degrada gracioso.
    return null;
  }
}

async function writePlaceCache(
  placeId: string,
  tier: PlaceDetailsTier,
  payload: PlaceDetails,
): Promise<void> {
  const expiresAt = new Date(Date.now() + PLACE_CACHE_TTL_DAYS * 24 * 60 * 60 * 1000);
  try {
    await prisma.placeCache.upsert({
      where: { placeId_tier: { placeId, tier } },
      create: { placeId, tier, payload: payload as object, expiresAt },
      update: { payload: payload as object, expiresAt },
    });
  } catch {
    // Falha de DB não pode derrubar a request — só loga implicitamente.
  }
}

function getApiKey() {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error('GOOGLE_PLACES_API_KEY not configured');
  return key;
}

// ─── Place Details: SKU split para minimizar custo ────────────────────────────
//
// Google cobra Details em 3 SKUs distintos:
//   • Basic Data ($17/1k): place_id, name, formatted_address, geometry, types, url
//   • Contact Data (+$3/1k): website, formatted_phone_number, opening_hours
//   • Atmosphere Data (+$5/1k): rating, user_ratings_total, reviews, price_level
//
// Pedir todos os 3 = $25/1k = 2.5¢/call. Pedir só Basic = 1.7¢/call (32% menos).
// Como reviews + opening_hours só aparecem no modal expandido, fazemos lazy
// fetch desses SKUs sob demanda.
//
// Photos NUNCA é pedido aqui — usamos Pexels/Unsplash (custo zero pra Google).

export type PlaceDetailsTier = 'basic' | 'full';

const BASIC_FIELDS = [
  'place_id', 'name', 'formatted_address', 'geometry', 'types', 'url', 'website',
] as const;

const FULL_FIELDS = [
  ...BASIC_FIELDS,
  // Contact:
  'opening_hours',
  // Atmosphere:
  'rating', 'user_ratings_total', 'price_level', 'reviews',
] as const;

export async function getPlaceDetails(
  placeId: string,
  tier: PlaceDetailsTier = 'basic',
): Promise<PlaceDetails | null> {
  // 1) Tenta cache em DB primeiro (TTL 30d, sobrevive redeploy)
  const cached = await readPlaceCache(placeId, tier);
  if (cached) return cached;

  // 2) Cai pra Google só se cache miss
  const guarded = await withGoogleGuard('details', async () => {
    const key = getApiKey();
    const fields = (tier === 'full' ? FULL_FIELDS : BASIC_FIELDS).join(',');
    const url = `${BASE_URL}/place/details/json?place_id=${placeId}&fields=${fields}&language=pt-BR&key=${key}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    const data = await res.json();
    if (data.status !== 'OK') return null;
    return data.result as PlaceDetails;
  });

  // 3) Persiste no cache (fire-and-forget — não bloqueia a resposta)
  if (guarded.result) {
    void writePlaceCache(placeId, tier, guarded.result);
  }

  return guarded.result;
}

export interface PlaceSearchPage {
  results: PlaceSearchResult[];
  nextPageToken?: string;
}

export async function searchPlaces(
  query: string,
  location?: string,
  type?: string,
): Promise<PlaceSearchResult[]> {
  const guarded = await withGoogleGuard('text_search', async () => {
    const key = getApiKey();
    const params = new URLSearchParams({
      query: location ? `${query} em ${location}` : query,
      language: 'pt-BR',
      key,
    });
    if (type) params.set('type', type);

    const url = `${BASE_URL}/place/textsearch/json?${params}`;
    const res = await fetch(url, { next: { revalidate: 43200 } });
    const data = await res.json();
    if (data.status !== 'OK') return [];
    return (data.results as PlaceSearchResult[]).slice(0, 20);
  });
  return guarded.result ?? [];
}

// Múltiplas queries por tipo — garante diversidade de resultados (preço, bairro, estilo)
const TYPE_QUERIES: Record<string, string[]> = {
  restaurant: [
    'restaurantes',
    'restaurantes baratos',
    'restaurantes bairros locais',
    'cafés e bistrôs',
    'comida de rua e mercados',
  ],
  lodging: [
    'hotéis',
    'pousadas e hostels',
    'hotéis boutique',
    'apart-hotéis e residências',
  ],
  tourist_attraction: [
    'atrações turísticas',
    'parques e jardins',
    'museus e galerias',
    'pontos históricos',
    'vida noturna e entretenimento',
  ],
  museum: [
    'museus',
    'galerias de arte',
    'centros culturais',
  ],
};

async function fetchOnePage(
  query: string,
  location: string,
  type: 'restaurant' | 'lodging' | 'tourist_attraction' | 'museum',
  pageToken?: string,
): Promise<PlaceSearchPage> {
  const guarded = await withGoogleGuard('text_search', async () => {
    const key = getApiKey();
    let url: string;
    if (pageToken) {
      const params = new URLSearchParams({ pagetoken: pageToken, key });
      url = `${BASE_URL}/place/textsearch/json?${params}`;
    } else {
      const params = new URLSearchParams({
        query: `${query} em ${location}`,
        language: 'pt-BR',
        key,
      });
      if (type === 'restaurant' || type === 'lodging') {
        params.set('type', type);
      }
      url = `${BASE_URL}/place/textsearch/json?${params}`;
    }

    const res = await fetch(url, {
      next: { revalidate: pageToken ? 0 : 21600 },
    });
    const data = await res.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return { results: [] as PlaceSearchResult[] };
    }

    return {
      results: (data.results ?? []) as PlaceSearchResult[],
      nextPageToken: data.next_page_token as string | undefined,
    } as PlaceSearchPage;
  });
  return guarded.result ?? { results: [] };
}

// Mantida para compatibilidade com chamadas externas existentes
export async function searchPlacesByType(
  location: string,
  type: 'restaurant' | 'lodging' | 'tourist_attraction' | 'museum',
  pageToken?: string,
): Promise<PlaceSearchPage> {
  const queries = TYPE_QUERIES[type] ?? [type];
  return fetchOnePage(queries[0], location, type, pageToken);
}

/**
 * Busca até `limit` lugares com diversidade real:
 * executa várias queries diferentes em paralelo e pagina cada uma,
 * depois mescla e deduplica por place_id.
 */
export async function searchPlacesByTypeWithLimit(
  location: string,
  type: 'restaurant' | 'lodging' | 'tourist_attraction' | 'museum',
  limit = 60,
): Promise<{ results: PlaceSearchResult[] }> {
  const queries = TYPE_QUERIES[type] ?? [type];
  const seen = new Set<string>();
  const results: PlaceSearchResult[] = [];

  // Busca as queries em paralelo — cada uma retorna até 3 páginas (60 resultados)
  await Promise.all(
    queries.map(async (query) => {
      let pageToken: string | undefined;

      for (let page = 0; page < 3; page++) {
        if (page > 0) {
          // Google exige pausa antes de usar o next_page_token
          await new Promise((r) => setTimeout(r, 2000));
        }

        const pageData = await fetchOnePage(query, location, type, pageToken);

        for (const place of pageData.results) {
          if (!seen.has(place.place_id)) {
            seen.add(place.place_id);
            results.push(place);
          }
        }

        pageToken = pageData.nextPageToken;
        if (!pageToken) break;
      }
    }),
  );

  // Diversidade máxima: intercala lugares com e sem rating para que hotéis/
  // restaurantes mais baratos, pouco avaliados ou sem metadados também apareçam
  // dentro do limite — não apenas os mais bem avaliados.
  const rated = results
    .filter((r) => r.rating != null)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  const unrated = results.filter((r) => r.rating == null);

  const interleaved: PlaceSearchResult[] = [];
  const total = rated.length + unrated.length;
  // Proporção 3:1 (rated:unrated) — prioriza qualidade mas garante presença
  // de opções sem metadados.
  let ri = 0;
  let ui = 0;
  for (let i = 0; i < total; i++) {
    if (i % 4 === 3 && ui < unrated.length) {
      interleaved.push(unrated[ui++]);
    } else if (ri < rated.length) {
      interleaved.push(rated[ri++]);
    } else if (ui < unrated.length) {
      interleaved.push(unrated[ui++]);
    }
  }

  return { results: interleaved.slice(0, limit) };
}

export async function autocomplete(
  input: string,
  sessionToken?: string,
): Promise<AutocompleteResult[]> {
  const guarded = await withGoogleGuard('autocomplete', async () => {
    const key = getApiKey();
    const params = new URLSearchParams({
      input,
      language: 'pt-BR',
      // (regions) = cidades + regiões + países (SKU mais barato que POIs).
      types: '(regions)',
      key,
    });
    if (sessionToken) params.set('sessiontoken', sessionToken);

    const url = `${BASE_URL}/place/autocomplete/json?${params}`;
    const res = await fetch(url, { next: { revalidate: 604800 } });
    const data = await res.json();
    if (data.status !== 'OK') return [];
    return (data.predictions as AutocompleteResult[]).slice(0, 5);
  });
  return guarded.result ?? [];
}

export async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  const guarded = await withGoogleGuard('geocode', async () => {
    const key = getApiKey();
    const params = new URLSearchParams({ address, language: 'pt-BR', key });
    const res = await fetch(`${BASE_URL}/geocode/json?${params}`, {
      next: { revalidate: 86400 },
    });
    const data = await res.json();
    if (data.status !== 'OK' || !data.results?.[0]) return null;
    return data.results[0].geometry.location as { lat: number; lng: number };
  });
  return guarded.result;
}
