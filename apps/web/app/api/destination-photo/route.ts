import { NextRequest } from 'next/server';
import { ok, err, handleError } from '@/lib/api';
import { searchPlaces } from '@/lib/integrations/google/places-service';

// Cache por 7 dias — hero photos de destinos são extremamente estáveis e
// cada miss aqui dispara uma chamada Text Search (paga) ao Google.
export const revalidate = 604800;

// GET /api/destination-photo?q=Bali
export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q');
    if (!q) return err('q é obrigatório', 400);

    const key = process.env.GOOGLE_PLACES_API_KEY;
    if (!key) return ok({ photoUrl: null });

    // Query mais específica para evitar resultados de marcas (ex.: "Patagonia")
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

    // Em vez de fazer fetch para resolver o redirect do Google (que consome
    // uma quota extra de Place Photo por chamada), retornamos a URL do nosso
    // proxy /api/place-photo — que já tem cache server de 24h e resolve o
    // redirect uma única vez quando o browser pedir a imagem.
    const photoUrl = `/api/place-photo?ref=${encodeURIComponent(photo.photo_reference)}&maxwidth=1600`;

    return ok({ photoUrl });
  } catch (error) {
    return handleError(error);
  }
}
