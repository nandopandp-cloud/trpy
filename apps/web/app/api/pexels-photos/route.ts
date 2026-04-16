import { NextRequest } from 'next/server';
import { ok, err, handleError } from '@/lib/api';

export const revalidate = 3600;

// GET /api/pexels-photos?q=Paris&per_page=10
export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q');
    if (!q) return err('q é obrigatório', 400);

    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) return err('Pexels API key não configurada', 500);

    const perPage = Math.min(Number(req.nextUrl.searchParams.get('per_page') ?? '10'), 10);

    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=${perPage}&orientation=landscape`;

    const res = await fetch(url, {
      headers: { Authorization: apiKey },
      next: { revalidate: 3600 }, // cache 1h
    });

    if (!res.ok) return err('Erro ao buscar fotos', 502);

    const data = await res.json();

    const photos = (data.photos ?? []).map((p: any) => ({
      id: String(p.id),
      url: p.src.large2x ?? p.src.large,
      thumb: p.src.medium,
      alt: p.alt ?? q,
      photographer: p.photographer,
    }));

    return ok({ photos });
  } catch (error) {
    return handleError(error);
  }
}
