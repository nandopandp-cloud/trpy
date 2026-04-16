import { NextRequest, NextResponse } from 'next/server';
import { ok, err, handleError } from '@/lib/api';
import { searchPlaces } from '@/lib/integrations/google/places-service';

export const revalidate = 86400;

// GET /api/destination-photo?q=Bali
export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q');
    if (!q) return err('q é obrigatório', 400);

    const key = process.env.GOOGLE_PLACES_API_KEY;
    if (!key) return ok({ photoUrl: null });

    // Search with travel-specific terms to avoid brand results (e.g. "Patagonia" clothing)
    const travelQuery = `${q} destino turístico viagem`;
    const results = await searchPlaces(travelQuery);

    // Filter out results that are clearly not destinations (businesses, brands)
    // Prefer results with types like locality, natural_feature, country, etc.
    const destinationTypes = ['locality', 'natural_feature', 'country', 'administrative_area_level_1', 'tourist_attraction', 'park', 'point_of_interest'];
    const best =
      results.find(r => r.types?.some(t => destinationTypes.includes(t))) ??
      results[0];

    const photo = best?.photos?.[0];

    if (!photo) return ok({ photoUrl: null });

    // Higher resolution for hero images
    const googlePhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photo_reference=${photo.photo_reference}&key=${key}`;
    const photoRes = await fetch(googlePhotoUrl, { redirect: 'follow' });
    const photoUrl = photoRes.url;

    return ok({ photoUrl });
  } catch (error) {
    return handleError(error);
  }
}
