import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { ok, err, handleError } from '@/lib/api';
import { searchPlacesByType } from '@/lib/integrations/google/places-service';

const VALID_TYPES = ['restaurant', 'lodging', 'tourist_attraction', 'museum'] as const;
type PlaceType = typeof VALID_TYPES[number];
// GET /api/recommendations?destination=Paris&type=restaurant
export async function GET(req: NextRequest) {
  try {
    const destination = req.nextUrl.searchParams.get('destination');
    const type = req.nextUrl.searchParams.get('type') as PlaceType | null;
    if (!destination) return err('destination é obrigatório', 400);
    if (type && !VALID_TYPES.includes(type)) return err('type inválido', 400);
    if (type) {
      const places = await searchPlacesByType(destination, type);
      return ok(places);
    }
    // Busca todos os tipos em paralelo
    const [restaurants, hotels, attractions] = await Promise.all([
      searchPlacesByType(destination, 'restaurant'),
      searchPlacesByType(destination, 'lodging'),
      searchPlacesByType(destination, 'tourist_attraction'),
    ]);
    return ok({ restaurants, hotels, attractions });
  } catch (error) {
    return handleError(error);
  }
}
