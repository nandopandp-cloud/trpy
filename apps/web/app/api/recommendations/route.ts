import { NextRequest } from 'next/server';
export const revalidate = 1800;
import { ok, err, handleError } from '@/lib/api';
import { searchPlacesByTypeWithLimit } from '@/lib/integrations/google/places-service';

const VALID_TYPES = ['restaurant', 'lodging', 'tourist_attraction', 'museum'] as const;
type PlaceType = typeof VALID_TYPES[number];

// GET /api/recommendations?destination=Paris&type=restaurant&limit=40
export async function GET(req: NextRequest) {
  try {
    const destination = req.nextUrl.searchParams.get('destination');
    const type = req.nextUrl.searchParams.get('type') as PlaceType | null;
    const limitParam = req.nextUrl.searchParams.get('limit');
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 60) : 40;

    if (!destination) return err('destination é obrigatório', 400);
    if (type && !VALID_TYPES.includes(type)) return err('type inválido', 400);

    if (type) {
      const { results } = await searchPlacesByTypeWithLimit(destination, type, limit);
      return ok(results);
    }

    // Fetch all types in parallel — each up to `limit` results
    const [restaurants, hotels, attractions] = await Promise.all([
      searchPlacesByTypeWithLimit(destination, 'restaurant', limit),
      searchPlacesByTypeWithLimit(destination, 'lodging', limit),
      searchPlacesByTypeWithLimit(destination, 'tourist_attraction', limit),
    ]);

    return ok({
      restaurants: restaurants.results,
      hotels: hotels.results,
      attractions: attractions.results,
    });
  } catch (error) {
    return handleError(error);
  }
}
