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

    // ── 2) Unsplash (fallback — só se Pexels não retornou) ───────────────────
    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
    if (unsplashKey) {
      const query = encodeURIComponent(`${q} travel`);
      const unsplashRes = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=1&orientation=landscape`,
        {
          headers: { Authorization: `Client-ID ${unsplashKey}` },
          next: { revalidate: 604800 },
        },
      );
      if (unsplashRes.ok) {
        const data = await unsplashRes.json();
        const photo = data.results?.[0];
        if (photo?.urls?.regular) {
          return ok({ photoUrl: photo.urls.regular as string, source: 'unsplash' });
        }
      }
    }

    return ok({ photoUrl: null });
  } catch (error) {
    return handleError(error);
  }
}
