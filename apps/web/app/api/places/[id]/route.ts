import { NextRequest } from 'next/server';
import { ok, err, handleError } from '@/lib/api';
import { getPlaceDetails } from '@/lib/integrations/google/places-service';
import { checkRateLimit } from '@/lib/rate-limit';

export const revalidate = 86400;

// place_id do Google é ASCII seguro, usualmente até ~200 chars.
const PLACE_ID_RE = /^[A-Za-z0-9_\-]{5,256}$/;

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const rl = checkRateLimit(req, { key: 'places-details', max: 60, windowMs: 60_000 });
    if (rl.limited) return err('Rate limit excedido', 429);

    if (!PLACE_ID_RE.test(params.id)) return err('place_id inválido', 400);

    const place = await getPlaceDetails(params.id);
    if (!place) return err('Local não encontrado', 404);
    return ok(place);
  } catch (error) {
    return handleError(error);
  }
}
