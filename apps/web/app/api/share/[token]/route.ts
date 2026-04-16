import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, handleError } from '@/lib/api';

// GET /api/share/[token] — public, no auth required
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const trip = await prisma.trip.findFirst({
      where: { shareToken: params.token, isDeleted: false },
      include: {
        user: { select: { name: true, image: true } },
        itineraryDays: {
          orderBy: { dayNumber: 'asc' },
          include: {
            items: { orderBy: { order: 'asc' } },
          },
        },
        expenses: { orderBy: { date: 'desc' } },
      },
    });

    if (!trip) return err('Planejamento não encontrado ou link expirado', 404);

    // Strip sensitive fields before returning
    const { userId, shareToken, isDeleted, ...publicTrip } = trip;

    return ok(publicTrip);
  } catch (error) {
    return handleError(error);
  }
}
