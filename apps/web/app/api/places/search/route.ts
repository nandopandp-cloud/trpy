import { NextRequest } from 'next/server';
export const revalidate = 1800;
import { ok, err, handleError } from '@/lib/api';
import { searchPlaces, searchPlacesByTypeWithLimit } from '@/lib/integrations/google/places-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const query = searchParams.get('q');
    const location = searchParams.get('location') ?? undefined;
    const type = searchParams.get('type') as 'restaurant' | 'lodging' | 'tourist_attraction' | 'museum' | null;
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 60) : 60;

    if (!query && !location) {
      return err('Parâmetro q ou location é obrigatório');
    }
    let results;
    if (!query && location && type) {
      const page = await searchPlacesByTypeWithLimit(location, type, limit);
      results = page.results;
    } else {
      results = await searchPlaces(query ?? location!, location, type ?? undefined);
    }
    return ok(results);
  } catch (error) {
    return handleError(error);
  }
}
