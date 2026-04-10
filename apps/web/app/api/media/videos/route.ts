import { NextRequest } from 'next/server';
import { ok, err, handleError } from '@/lib/api';
import { searchVideos } from '@/lib/integrations/media';

export const dynamic = 'force-dynamic';

// GET /api/media/videos?query=paris&perPage=10
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const query = searchParams.get('query')?.trim();
    if (!query) return err('Parâmetro "query" é obrigatório', 400);

    const perPage = Math.min(
      Math.max(parseInt(searchParams.get('perPage') ?? '10', 10) || 10, 1),
      20,
    );
    const orientationParam = searchParams.get('orientation');
    const orientation =
      orientationParam === 'portrait' ||
      orientationParam === 'square' ||
      orientationParam === 'landscape'
        ? orientationParam
        : 'landscape';

    const result = await searchVideos({ query, perPage, orientation });
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
