import { NextRequest } from 'next/server';
import { ok, err, handleError } from '@/lib/api';
import { searchPlaces, searchPlacesByType } from '@/lib/integrations/google/places-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const query = searchParams.get('q');
    const location = searchParams.get('location') ?? undefined;
    const type = searchParams.get('type') as 'restaurant' | 'lodging' | 'tourist_attraction' | 'museum' | null;

    if (!query && !location) {
      return err('Parâmetro q ou location é obrigatório');
    }

    let results;
    if (!query && location && type) {
      results = await searchPlacesByType(location, type);
    } else {
      results = await searchPlaces(query ?? location!, location, type ?? undefined);
    }

    return ok(results);
  } catch (error) {
    return handleError(error);
  }
}
