import { NextRequest } from 'next/server';
export const revalidate = 21600;
import { ok, err, handleError } from '@/lib/api';
import { searchPlaces, searchPlacesByTypeWithLimit } from '@/lib/integrations/google/places-service';
import { checkRateLimit } from '@/lib/rate-limit';

const VALID_TYPES = ['restaurant', 'lodging', 'tourist_attraction', 'museum'] as const;
type ValidType = typeof VALID_TYPES[number];

const SAFE_STRING = /^[A-Za-zÀ-ÿ0-9\s'\-,.()]+$/;
const MAX_STR = 120;

export async function GET(req: NextRequest) {
  try {
    const rl = checkRateLimit(req, { key: 'places-search', max: 30, windowMs: 60_000 });
    if (rl.limited) {
      return err('Rate limit excedido', 429);
    }

    const { searchParams } = req.nextUrl;
    const query = searchParams.get('q')?.trim().slice(0, MAX_STR) || null;
    const location = searchParams.get('location')?.trim().slice(0, MAX_STR) || undefined;
    const typeParam = searchParams.get('type');
    const type = (VALID_TYPES as readonly string[]).includes(typeParam ?? '')
      ? (typeParam as ValidType)
      : null;

    if (query && !SAFE_STRING.test(query)) return err('q inválido', 400);
    if (location && !SAFE_STRING.test(location)) return err('location inválido', 400);

    const limitParam = searchParams.get('limit');
    const limit = limitParam
      ? Math.min(Math.max(parseInt(limitParam, 10) || 60, 1), 60)
      : 60;

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
