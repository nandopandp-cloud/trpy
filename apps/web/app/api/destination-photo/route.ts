import { NextRequest } from 'next/server';
import { ok, err, handleError } from '@/lib/api';
import { searchPlaces } from '@/lib/integrations/google/places-service';
import { checkRateLimit } from '@/lib/rate-limit';

export const revalidate = 604800;

// Caracteres seguros para query de destino: letras (incluindo acentos comuns),
// números, espaços e pontuação simples. Sem flag u/p para manter compat ES5.
const SAFE_QUERY = /^[A-Za-zÀ-ÿ0-9\s'\-,.()]+$/;
const MAX_Q = 80;

// GET /api/destination-photo?q=Bali
export async function GET(req: NextRequest) {
  try {
    const rl = checkRateLimit(req, { key: 'destination-photo', max: 60, windowMs: 60_000 });
    if (rl.limited) return err('Rate limit excedido', 429);

    const q = req.nextUrl.searchParams.get('q')?.trim().slice(0, MAX_Q) ?? '';
    if (!q) return err('q é obrigatório', 400);
    if (!SAFE_QUERY.test(q)) return err('q inválido', 400);

    const key = process.env.GOOGLE_PLACES_API_KEY;
    if (!key) return ok({ photoUrl: null });

    const travelQuery = `${q} destino turístico viagem`;
    const results = await searchPlaces(travelQuery);

    const destinationTypes = [
      'locality', 'natural_feature', 'country',
      'administrative_area_level_1', 'tourist_attraction',
      'park', 'point_of_interest',
    ];
    const best =
      results.find((r) => r.types?.some((t) => destinationTypes.includes(t))) ??
      results[0];

    const photo = best?.photos?.[0];
    if (!photo) return ok({ photoUrl: null });

    // URL do nosso proxy — consome o kill switch no endpoint final.
    const photoUrl = `/api/place-photo?ref=${encodeURIComponent(photo.photo_reference)}&maxwidth=1600`;
    return ok({ photoUrl });
  } catch (error) {
    return handleError(error);
  }
}
