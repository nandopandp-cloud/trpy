import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ok, err, handleError } from '@/lib/api';
import { getCurrentUserId } from '@/lib/auth-utils';

const updateTripSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  destination: z.string().min(1).max(200).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  budget: z.number().positive().optional(),
  description: z.string().max(1000).nullable().optional(),
  coverImage: z.string().url().nullable().optional(),
  currency: z.string().length(3).optional(),
  status: z.enum(['PLANNING', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
});

// GET /api/trips/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return err('Não autenticado', 401);

    const trip = await prisma.trip.findFirst({
      where: { id: params.id, userId, isDeleted: false },
      include: {
        itineraryDays: {
          orderBy: { dayNumber: 'asc' },
          include: {
            items: {
              orderBy: { order: 'asc' },
              select: {
                id: true, dayId: true, type: true, title: true, description: true,
                location: true, latitude: true, longitude: true, startTime: true,
                durationMins: true, cost: true, currency: true, bookingUrl: true, order: true,
              },
            },
          },
        },
        expenses: {
          orderBy: { date: 'desc' },
          select: {
            id: true, tripId: true, category: true, title: true, amount: true,
            currency: true, date: true, notes: true,
          },
        },
      },
    });

    if (!trip) return err('Viagem não encontrada', 404);

    return ok(trip);
  } catch (error) {
    return handleError(error);
  }
}

// PUT /api/trips/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return err('Não autenticado', 401);

    const existing = await prisma.trip.findFirst({
      where: { id: params.id, userId, isDeleted: false },
    });
    if (!existing) return err('Viagem não encontrada', 404);

    const body = await req.json();
    const data = updateTripSchema.parse(body);

    const start = data.startDate ? new Date(data.startDate) : existing.startDate;
    const end = data.endDate ? new Date(data.endDate) : existing.endDate;

    if (end <= start) {
      return err('A data de fim deve ser após a data de início');
    }

    const trip = await prisma.trip.update({
      where: { id: params.id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.destination && { destination: data.destination }),
        ...(data.startDate && { startDate: start }),
        ...(data.endDate && { endDate: end }),
        ...(data.budget !== undefined && { budget: data.budget }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
        ...(data.currency && { currency: data.currency }),
        ...(data.status && { status: data.status }),
      },
    });

    return ok(trip);
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/trips/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return err('Não autenticado', 401);

    const existing = await prisma.trip.findFirst({
      where: { id: params.id, userId, isDeleted: false },
    });
    if (!existing) return err('Viagem não encontrada', 404);

    await prisma.trip.update({
      where: { id: params.id },
      data: { isDeleted: true },
    });

    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
