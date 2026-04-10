import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@trpy/database';
import { ok, err, handleError } from '@/lib/api';
import { getCurrentUserId } from '@/lib/auth-utils';

const createSchema = z.object({
  googlePlaceId: z.string().min(1),
  placeName: z.string().min(1).max(200),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().max(2000).optional(),
  visitedOn: z.string().optional(), // ISO date string
});

// GET /api/place-reviews?placeId=XXX
export async function GET(req: NextRequest) {
  try {
    const placeId = req.nextUrl.searchParams.get('placeId');
    if (!placeId) return err('placeId obrigatório', 400);

    const reviews = await prisma.placeReview.findMany({
      where: { googlePlaceId: placeId },
      include: { user: { select: { id: true, name: true, image: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return ok(reviews);
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/place-reviews
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return err('Não autenticado', 401);

    const body = await req.json();
    const data = createSchema.parse(body);

    const review = await prisma.placeReview.upsert({
      where: { userId_googlePlaceId: { userId, googlePlaceId: data.googlePlaceId } },
      create: {
        userId,
        googlePlaceId: data.googlePlaceId,
        placeName: data.placeName,
        rating: data.rating,
        title: data.title,
        body: data.body,
        visitedOn: data.visitedOn ? new Date(data.visitedOn) : null,
      },
      update: {
        placeName: data.placeName,
        rating: data.rating,
        title: data.title,
        body: data.body,
        visitedOn: data.visitedOn ? new Date(data.visitedOn) : null,
      },
      include: { user: { select: { id: true, name: true, image: true } } },
    });

    return ok(review, 201);
  } catch (error) {
    return handleError(error);
  }
}
