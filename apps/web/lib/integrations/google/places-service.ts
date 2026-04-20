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

const BASE_URL = 'https://maps.googleapis.com/maps/api';

function getApiKey() {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error('GOOGLE_PLACES_API_KEY not configured');
  return key;
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  const guarded = await withGoogleGuard('details', async () => {
    const key = getApiKey();
    // Billing do Google Places Details é cobrado por combinação de "SKU" (Basic /
    // Contact / Atmosphere). Mantemos só os campos usados pela UI para não pagar
    // por SKUs que a gente não renderiza.
    const fields = [
      'place_id', 'name', 'formatted_address',
      'website', 'rating', 'user_ratings_total', 'price_level', 'types',
      'geometry', 'photos', 'reviews', 'opening_hours', 'url',
    ].join(',');

    const url = `${BASE_URL}/place/details/json?place_id=${placeId}&fields=${fields}&language=pt-BR&key=${key}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    const data = await res.json();
    if (data.status !== 'OK') return null;
    return data.result as PlaceDetails;
  });
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

/**
 * Retorna a URL do nosso proxy /api/place-photo, que:
 *   - NÃO expõe a chave da API para o cliente
 *   - Aplica cache edge de 7 dias
 *   - Respeita o kill switch via a rota server-side
 *
 * A chave pública `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` continua sendo usada
 * APENAS pelo Maps JS SDK (mapa interativo) — que exige key no browser.
 */
export function getPhotoUrl(photoRef: string, maxWidth = 800): string {
  return `/api/place-photo?ref=${encodeURIComponent(photoRef)}&maxwidth=${maxWidth}`;
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
