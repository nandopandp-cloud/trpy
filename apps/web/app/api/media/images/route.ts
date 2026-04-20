import { NextRequest } from 'next/server';
import { ok, err, handleError } from '@/lib/api';
import { searchImages } from '@/lib/integrations/media';

// Cache de 24h no edge — covers de destino são estáveis
export const revalidate = 86400;

// GET /api/media/images?query=paris&perPage=12&orientation=landscape
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const query = searchParams.get('query')?.trim();
    if (!query) return err('Parâmetro "query" é obrigatório', 400);

    const perPage = Math.min(
      Math.max(parseInt(searchParams.get('perPage') ?? '12', 10) || 12, 1),
      30,
    );
    const orientationParam = searchParams.get('orientation');
    const orientation =
      orientationParam === 'portrait' ||
      orientationParam === 'square' ||
      orientationParam === 'landscape'
        ? orientationParam
        : 'landscape';

    const result = await searchImages({ query, perPage, orientation });
    return ok(result);
  } catch (error) {
    return handleError(error);
  }
}
