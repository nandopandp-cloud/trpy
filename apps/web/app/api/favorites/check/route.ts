import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { FavoriteType } from '@trpy/database';
import { ok, err, handleError } from '@/lib/api';
import { isFavorited } from '@/lib/services/favorites-service';
import { getCurrentUserId } from '@/lib/auth-utils';

// GET /api/favorites/check?type=PLACE&externalId=xyz
export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return err('Não autenticado', 401);

    const { searchParams } = req.nextUrl;
    const type = searchParams.get('type') as FavoriteType | null;
    const externalId = searchParams.get('externalId');
    if (!type || !externalId) {
      return err('Parâmetros type e externalId são obrigatórios');
    }
    const favorited = await isFavorited(userId, type, externalId);
    return ok({ favorited });
  } catch (error) {
    return handleError(error);
  }
}
