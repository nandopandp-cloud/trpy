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

const BASE_URL = 'https://maps.googleapis.com/maps/api';

function getApiKey() {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) throw new Error('GOOGLE_PLACES_API_KEY not configured');
  return key;
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  const key = getApiKey();
  const fields = [
    'place_id', 'name', 'formatted_address', 'formatted_phone_number',
    'website', 'rating', 'user_ratings_total', 'price_level', 'types',
    'geometry', 'photos', 'reviews', 'opening_hours', 'url',
  ].join(',');

  const url = `${BASE_URL}/place/details/json?place_id=${placeId}&fields=${fields}&language=pt-BR&key=${key}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  const data = await res.json();

  if (data.status !== 'OK') return null;
  return data.result as PlaceDetails;
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
  const key = getApiKey();
  const params = new URLSearchParams({
    query: location ? `${query} em ${location}` : query,
    language: 'pt-BR',
    key,
  });
  if (type) params.set('type', type);

  const url = `${BASE_URL}/place/textsearch/json?${params}`;
  const res = await fetch(url, { next: { revalidate: 1800 } });
  const data = await res.json();

  if (data.status !== 'OK') return [];
  return (data.results as PlaceSearchResult[]).slice(0, 20);
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

  // Não cachear pagetoken — tokens expiram em 2 minutos e não são reutilizáveis
  const res = await fetch(url, {
    next: { revalidate: pageToken ? 0 : 1800 },
  });
  const data = await res.json();

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    return { results: [] };
  }

  return {
    results: (data.results ?? []) as PlaceSearchResult[],
    nextPageToken: data.next_page_token as string | undefined,
  };
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

  // Ordena por rating descendente para colocar os melhores primeiro,
  // mas preserva diversidade pois vieram de queries distintas
  results.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  return { results: results.slice(0, limit) };
}

export async function autocomplete(
  input: string,
  sessionToken?: string,
): Promise<AutocompleteResult[]> {
  const key = getApiKey();
  const params = new URLSearchParams({
    input,
    language: 'pt-BR',
    key,
  });
  if (sessionToken) params.set('sessiontoken', sessionToken);

  const url = `${BASE_URL}/place/autocomplete/json?${params}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== 'OK') return [];
  return data.predictions as AutocompleteResult[];
}

export function getPhotoUrl(photoRef: string, maxWidth = 800): string {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
  return `${BASE_URL}/place/photo?maxwidth=${maxWidth}&photo_reference=${photoRef}&key=${key}`;
}

export async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  const key = getApiKey();
  const params = new URLSearchParams({ address, language: 'pt-BR', key });
  const res = await fetch(`${BASE_URL}/geocode/json?${params}`, {
    next: { revalidate: 86400 },
  });
  const data = await res.json();
  if (data.status !== 'OK' || !data.results?.[0]) return null;
  return data.results[0].geometry.location as { lat: number; lng: number };
}
