import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { FavoriteType } from '@trpy/database';
import { ok, err, handleError } from '@/lib/api';
import { isFavorited } from '@/lib/services/favorites-service';
import { prisma } from '@/lib/prisma';

async function getDemoUser() {
  return prisma.user.upsert({
    where: { email: 'demo@trpy.app' },
    update: {},
    create: { email: 'demo@trpy.app', name: 'Demo User' },
  });
}
// GET /api/favorites/check?type=PLACE&externalId=xyz
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const type = searchParams.get('type') as FavoriteType | null;
    const externalId = searchParams.get('externalId');
    if (!type || !externalId) {
      return err('Parâmetros type e externalId são obrigatórios');
    }
    const user = await getDemoUser();
    const favorited = await isFavorited(user.id, type, externalId);
    return ok({ favorited });
  } catch (error) {
    return handleError(error);
  }
}
