import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, handleError } from '@/lib/api';
import { getCurrentUserId } from '@/lib/auth-utils';

// DELETE /api/itinerary-days/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return err('Não autenticado', 401);

    // Verify the day belongs to a trip owned by this user
    const day = await prisma.itineraryDay.findFirst({
      where: { id: params.id },
      include: { trip: { select: { userId: true } } },
    });

    if (!day) return err('Dia não encontrado', 404);
    if (day.trip.userId !== userId) return err('Sem permissão', 403);

    await prisma.itineraryDay.delete({ where: { id: params.id } });

    return ok({ id: params.id });
  } catch (error) {
    return handleError(error);
  }
}
