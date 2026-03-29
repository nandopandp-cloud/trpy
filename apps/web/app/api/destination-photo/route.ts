import { NextRequest } from 'next/server';
import { ok, err, handleError } from '@/lib/api';
import { searchPlaces } from '@/lib/integrations/google/places-service';

export const dynamic = 'force-dynamic';

// GET /api/destination-photo?q=Bali
export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q');
    if (!q) return err('q é obrigatório', 400);

    const key = process.env.GOOGLE_PLACES_API_KEY;
    if (!key) return ok({ photoUrl: null });

    const results = await searchPlaces(q);
    const photo = results[0]?.photos?.[0];

    if (!photo) return ok({ photoUrl: null });

    // Seguir o redirect do Google para obter a URL final da imagem
    const googlePhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${photo.photo_reference}&key=${key}`;
    const photoRes = await fetch(googlePhotoUrl, { redirect: 'follow' });
    const photoUrl = photoRes.url;

    return ok({ photoUrl });
  } catch (error) {
    return handleError(error);
  }
}
