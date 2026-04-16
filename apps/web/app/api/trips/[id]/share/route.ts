import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, handleError } from '@/lib/api';
import { getCurrentUserId } from '@/lib/auth-utils';
import { randomBytes } from 'crypto';

// POST /api/trips/[id]/share — enable sharing (generate token if needed)
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return err('Não autenticado', 401);

    const trip = await prisma.trip.findFirst({
      where: { id: params.id, userId, isDeleted: false },
      select: { id: true, shareToken: true },
    });
    if (!trip) return err('Viagem não encontrada', 404);

    // Reuse existing token or generate a new one
    const token = trip.shareToken ?? randomBytes(24).toString('base64url');

    await prisma.trip.update({
      where: { id: params.id },
      data: { shareToken: token },
    });

    return ok({ token });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/trips/[id]/share — revoke sharing
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return err('Não autenticado', 401);

    const trip = await prisma.trip.findFirst({
      where: { id: params.id, userId, isDeleted: false },
      select: { id: true },
    });
    if (!trip) return err('Viagem não encontrada', 404);

    await prisma.trip.update({
      where: { id: params.id },
      data: { shareToken: null },
    });

    return ok({ revoked: true });
  } catch (error) {
    return handleError(error);
  }
}
