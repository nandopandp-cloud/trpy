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

const TYPE_QUERY: Record<string, string> = {
  restaurant:        'melhores restaurantes',
  lodging:           'melhores hotéis',
  tourist_attraction:'principais atrações turísticas',
  museum:            'museus',
};

export async function searchPlacesByType(
  location: string,
  type: 'restaurant' | 'lodging' | 'tourist_attraction' | 'museum',
  pageToken?: string,
): Promise<PlaceSearchPage> {
  const key = getApiKey();
  const queryTerm = TYPE_QUERY[type] ?? type;

  let url: string;
  if (pageToken) {
    // Next-page requests only need pagetoken + key
    const params = new URLSearchParams({ pagetoken: pageToken, key });
    url = `${BASE_URL}/place/textsearch/json?${params}`;
  } else {
    const params = new URLSearchParams({
      query: `${queryTerm} em ${location}`,
      language: 'pt-BR',
      key,
    });
    if (type === 'restaurant' || type === 'lodging') {
      params.set('type', type);
    }
    url = `${BASE_URL}/place/textsearch/json?${params}`;
  }

  const res = await fetch(url, { next: { revalidate: 1800 } });
  const data = await res.json();

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    return { results: [] };
  }

  return {
    results: (data.results ?? []) as PlaceSearchResult[],
    nextPageToken: data.next_page_token as string | undefined,
  };
}

/** Fetches up to `limit` places by paginating through Google's next_page_token. */
export async function searchPlacesByTypeWithLimit(
  location: string,
  type: 'restaurant' | 'lodging' | 'tourist_attraction' | 'museum',
  limit = 60,
): Promise<{ results: PlaceSearchResult[]; nextPageToken?: string }> {
  const results: PlaceSearchResult[] = [];
  let pageToken: string | undefined;

  // Google Text Search returns up to 20 results per page, max 3 pages (60 total)
  for (let page = 0; page < 3 && results.length < limit; page++) {
    if (page > 0) {
      // Google requires a short delay before using next_page_token
      await new Promise((r) => setTimeout(r, 2000));
    }
    const page_data = await searchPlacesByType(location, type, pageToken);
    results.push(...page_data.results);
    pageToken = page_data.nextPageToken;
    if (!pageToken) break;
  }

  return {
    results: results.slice(0, limit),
    nextPageToken: results.length >= limit ? pageToken : undefined,
  };
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
