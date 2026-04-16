import { NextRequest } from 'next/server';
import { z } from 'zod';
import { TripStatus } from '@trpy/database';
import { prisma } from '@/lib/prisma';
import { ok, err, handleError } from '@/lib/api';
import { getCurrentUserId } from '@/lib/auth-utils';
import { getBestCoverImage } from '@/lib/integrations/media';

const createTripSchema = z.object({
  title: z.string().min(1).max(100),
  destination: z.string().min(1).max(200),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  budget: z.number().positive(),
  description: z.string().max(1000).optional(),
  coverImage: z.string().url().optional(),
  currency: z.string().length(3).default('BRL'),
});

// GET /api/trips
export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return err('Não autenticado', 401);

    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status') as TripStatus | null;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '12'), 50);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const where = {
      userId,
      isDeleted: false,
      ...(status ? { status } : {}),
    };

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true, title: true, destination: true, description: true,
          coverImage: true, startDate: true, endDate: true, budget: true,
          totalSpent: true, currency: true, status: true, createdAt: true,
        },
      }),
      prisma.trip.count({ where }),
    ]);

    return ok({ trips, total, limit, offset });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/trips
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return err('Não autenticado', 401);

    const body = await req.json();
    const data = createTripSchema.parse(body);

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (end <= start) {
      return err('A data de fim deve ser após a data de início');
    }

    // Auto-enrich: if no cover was explicitly provided, try to fetch one from
    // the media engine. Never blocks trip creation on provider failures.
    let coverImage = data.coverImage;
    if (!coverImage) {
      try {
        coverImage = (await getBestCoverImage(data.destination)) ?? undefined;
      } catch (e) {
        console.error('[trips.POST] auto-enrich cover failed', e);
      }
    }

    const trip = await prisma.trip.create({
      data: {
        userId,
        title: data.title,
        destination: data.destination,
        startDate: start,
        endDate: end,
        budget: data.budget,
        description: data.description,
        coverImage,
        currency: data.currency,
      },
    });

    return ok(trip, 201);
  } catch (error) {
    return handleError(error);
  }
}
