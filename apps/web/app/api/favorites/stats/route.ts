export const dynamic = 'force-dynamic';
import { ok, handleError, err } from '@/lib/api';
import { getFavoriteStats } from '@/lib/services/favorites-service';
import { getCurrentUserId } from '@/lib/auth-utils';

export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return err('Não autenticado', 401);

    const stats = await getFavoriteStats(userId);
    return ok(stats);
  } catch (error) {
    return handleError(error);
  }
}
