import { NextRequest } from 'next/server';
import { prisma } from '@trpy/database';
import { ok, err, handleError } from '@/lib/api';
import { getCurrentUserId } from '@/lib/auth-utils';

// DELETE /api/place-reviews/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return err('Não autenticado', 401);

    const review = await prisma.placeReview.findUnique({ where: { id: params.id } });
    if (!review) return err('Avaliação não encontrada', 404);
    if (review.userId !== userId) return err('Não autorizado', 403);

    await prisma.placeReview.delete({ where: { id: params.id } });
    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
