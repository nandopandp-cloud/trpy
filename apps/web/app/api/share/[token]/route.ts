import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok, err, handleError } from '@/lib/api';

// GET /api/share/[token] — public, no auth required
export const revalidate = 300;

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const trip = await prisma.trip.findFirst({
      where: { shareToken: params.token, isDeleted: false },
      select: {
        id: true, title: true, destination: true, description: true,
        coverImage: true, startDate: true, endDate: true, budget: true,
        totalSpent: true, currency: true, status: true, createdAt: true, updatedAt: true,
        user: { select: { name: true, image: true } },
        itineraryDays: {
          orderBy: { dayNumber: 'asc' },
          include: {
            items: {
              orderBy: { order: 'asc' },
              select: {
                id: true, type: true, title: true, description: true,
                location: true, startTime: true, durationMins: true,
                cost: true, currency: true, order: true,
              },
            },
          },
        },
        expenses: {
          orderBy: { date: 'desc' },
          select: {
            id: true, category: true, title: true, amount: true,
            currency: true, date: true, notes: true,
          },
        },
      },
    });

    if (!trip) return err('Planejamento não encontrado ou link expirado', 404);

    return ok(trip);
  } catch (error) {
    return handleError(error);
  }
}
