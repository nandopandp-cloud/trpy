import { NextRequest } from 'next/server';
import { z } from 'zod';
import { TripStatus } from '@trpy/database';
import { prisma } from '@/lib/prisma';
import { ok, err, handleError } from '@/lib/api';

const createTripSchema = z.object({
  title: z.string().min(1).max(100),
  destination: z.string().min(1).max(200),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  budget: z.number().positive(),
  description: z.string().max(1000).optional(),
  coverImage: z.string().url().optional(),
  currency: z.string().length(3).default('BRL'),
});

// TODO: substituir pelo userId real vindo do NextAuth
const DEMO_USER_ID = 'demo-user-id';

async function getOrCreateDemoUser() {
  return prisma.user.upsert({
    where: { email: 'demo@trpy.app' },
    update: {},
    create: { email: 'demo@trpy.app', name: 'Demo User' },
  });
}

// GET /api/trips
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const status = searchParams.get('status') as TripStatus | null;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '12'), 50);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    const user = await getOrCreateDemoUser();

    const where = {
      userId: user.id,
      isDeleted: false,
      ...(status ? { status } : {}),
    };

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
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
    const body = await req.json();
    const data = createTripSchema.parse(body);

    const user = await getOrCreateDemoUser();

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    if (end <= start) {
      return err('A data de fim deve ser após a data de início');
    }

    const trip = await prisma.trip.create({
      data: {
        userId: user.id,
        title: data.title,
        destination: data.destination,
        startDate: start,
        endDate: end,
        budget: data.budget,
        description: data.description,
        coverImage: data.coverImage,
        currency: data.currency,
      },
    });

    return ok(trip, 201);
  } catch (error) {
    return handleError(error);
  }
}
