import { handleError } from '@/lib/api';
import { ok } from '@/lib/api';
import { getFavoriteStats } from '@/lib/services/favorites-service';
import { prisma } from '@/lib/prisma';

async function getDemoUser() {
  return prisma.user.upsert({
    where: { email: 'demo@trpy.app' },
    update: {},
    create: { email: 'demo@trpy.app', name: 'Demo User' },
  });
}

export async function GET() {
  try {
    const user = await getDemoUser();
    const stats = await getFavoriteStats(user.id);
    return ok(stats);
  } catch (error) {
    return handleError(error);
  }
}
