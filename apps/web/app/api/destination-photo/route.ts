import { NextRequest } from 'next/server';
import { ok, err, handleError } from '@/lib/api';
import { checkRateLimit } from '@/lib/rate-limit';

// Cache longo — fotos de destino são estáveis
export const revalidate = 604800;

const SAFE_QUERY = /^[A-Za-zÀ-ÿ0-9\s'\-,.()]+$/;
const MAX_Q = 80;

// GET /api/destination-photo?q=Bali&w=1600
// Estratégia: Pexels primeiro (gratuito, sem custo por chamada).
// Google Places usado apenas se Pexels não retornar resultado.
export async function GET(req: NextRequest) {
  try {
    const rl = checkRateLimit(req, { key: 'destination-photo', max: 60, windowMs: 60_000 });
    if (rl.limited) return err('Rate limit excedido', 429);

    const q = req.nextUrl.searchParams.get('q')?.trim().slice(0, MAX_Q) ?? '';
    if (!q) return err('q é obrigatório', 400);
    if (!SAFE_QUERY.test(q)) return err('q inválido', 400);

    const maxWidth = Math.min(Number(req.nextUrl.searchParams.get('w') ?? '1200'), 1600);

    // ── 1) Pexels (primário — gratuito) ──────────────────────────────────────
    const pexelsKey = process.env.PEXELS_API_KEY;
    if (pexelsKey) {
      const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q + ' travel')}&per_page=3&orientation=landscape`;
      const pexelsRes = await fetch(pexelsUrl, {
        headers: { Authorization: pexelsKey },
        next: { revalidate: 604800 },
      });

      if (pexelsRes.ok) {
        const pexelsData = await pexelsRes.json();
        const photo = pexelsData.photos?.[0];
        if (photo) {
          const photoUrl = maxWidth >= 1200
            ? (photo.src.large2x ?? photo.src.large)
            : photo.src.large;
          return ok({
            photoUrl,
            source: 'pexels',
            photographer: photo.photographer,
          });
        }
      }
    }

    // ── 2) Google Places (fallback — só se Pexels não retornou) ──────────────
    // Importado dinamicamente para que o custo-guard só seja consultado quando
    // realmente necessário (evita hit desnecessário no DB quando Pexels resolve).
    const googleKey = process.env.GOOGLE_PLACES_API_KEY;
    if (googleKey) {
      const { searchPlaces } = await import('@/lib/integrations/google/places-service');
      const results = await searchPlaces(`${q} destino turístico viagem`);

      const destinationTypes = [
        'locality', 'natural_feature', 'country',
        'administrative_area_level_1', 'tourist_attraction', 'park', 'point_of_interest',
      ];
      const best =
        results.find((r) => r.types?.some((t) => destinationTypes.includes(t))) ?? results[0];

      const photo = best?.photos?.[0];
      if (photo) {
        const photoUrl = `/api/place-photo?ref=${encodeURIComponent(photo.photo_reference)}&maxwidth=${maxWidth}`;
        return ok({ photoUrl, source: 'google' });
      }
    }

    return ok({ photoUrl: null });
  } catch (error) {
    return handleError(error);
  }
}
