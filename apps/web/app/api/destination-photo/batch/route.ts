import { NextRequest } from 'next/server';
import { ok, err, handleError } from '@/lib/api';

// Cache de 7 dias no edge — resultados mudam apenas na segunda-feira
export const revalidate = 604800;

// POST /api/destination-photo/batch
// Body: { destinations: string[] }  (máx 20)
// Busca fotos para vários destinos de uma vez — Pexels primário, Unsplash fallback.
// Usado pelos TripStories para pré-carregar os thumbs de todos os bubbles de uma vez.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.destinations)) {
      return err('destinations[] obrigatório', 400);
    }

    const destinations: string[] = body.destinations
      .filter((d: unknown) => typeof d === 'string' && d.trim().length > 0)
      .slice(0, 20)
      .map((d: string) => d.trim());

    if (destinations.length === 0) return ok({});

    const pexelsKey = process.env.PEXELS_API_KEY;
    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;

    // Busca em paralelo — todas as destinações ao mesmo tempo
    const results = await Promise.all(
      destinations.map(async (dest) => {
        // 1) Pexels
        if (pexelsKey) {
          try {
            const query = encodeURIComponent(`${dest} travel landscape`);
            const res = await fetch(
              `https://api.pexels.com/v1/search?query=${query}&per_page=1&orientation=landscape`,
              {
                headers: { Authorization: pexelsKey },
                next: { revalidate: 604800 },
              },
            );
            if (res.ok) {
              const data = await res.json();
              const photo = data.photos?.[0];
              if (photo?.src?.large2x) {
                return { dest, url: photo.src.large2x as string, source: 'pexels' };
              }
            }
          } catch { /* fallback */ }
        }

        // 2) Unsplash
        if (unsplashKey) {
          try {
            const query = encodeURIComponent(`${dest} travel`);
            const res = await fetch(
              `https://api.unsplash.com/search/photos?query=${query}&per_page=1&orientation=landscape`,
              {
                headers: { Authorization: `Client-ID ${unsplashKey}` },
                next: { revalidate: 604800 },
              },
            );
            if (res.ok) {
              const data = await res.json();
              const photo = data.results?.[0];
              if (photo?.urls?.regular) {
                return { dest, url: photo.urls.regular as string, source: 'unsplash' };
              }
            }
          } catch { /* fallback */ }
        }

        return { dest, url: null, source: null };
      }),
    );

    // Monta mapa destination → url
    const photoMap: Record<string, string | null> = {};
    for (const r of results) {
      photoMap[r.dest] = r.url;
    }

    return ok(photoMap);
  } catch (error) {
    return handleError(error);
  }
}
