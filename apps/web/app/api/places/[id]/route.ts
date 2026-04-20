import { NextRequest } from 'next/server';
import { ok, err, handleError } from '@/lib/api';
import { getPlaceDetails } from '@/lib/integrations/google/places-service';

export const revalidate = 86400;

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const place = await getPlaceDetails(params.id);
    if (!place) return err('Local não encontrado', 404);
    return ok(place);
  } catch (error) {
    return handleError(error);
  }
}
