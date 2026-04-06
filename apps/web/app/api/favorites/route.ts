import { NextRequest } from 'next/server';
import { z } from 'zod';
import { FavoriteType } from '@trpy/database';
import { ok, err, handleError } from '@/lib/api';
import { addFavorite, removeFavorite, getAllFavorites, getFavoritesByType } from '@/lib/services/favorites-service';
import { getCurrentUserId } from '@/lib/auth-utils';

const addSchema = z.object({
  type: z.nativeEnum(FavoriteType),
  externalId: z.string().min(1),
  name: z.string().min(1),
  image: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  googlePlaceId: z.string().optional(),
  youtubeVideoId: z.string().optional(),
  pinterestPinId: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const removeSchema = z.object({
  type: z.nativeEnum(FavoriteType),
  externalId: z.string().min(1),
});

// GET /api/favorites?type=PLACE
export async function GET(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return err('Não autenticado', 401);

    const type = req.nextUrl.searchParams.get('type') as FavoriteType | null;

    const favorites = type
      ? await getFavoritesByType(userId, type)
      : await getAllFavorites(userId);

    return ok(favorites);
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/favorites
export async function POST(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return err('Não autenticado', 401);

    const body = await req.json();
    const data = addSchema.parse(body);
    const favorite = await addFavorite({ userId, ...data });
    return ok(favorite, 201);
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/favorites
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return err('Não autenticado', 401);

    const body = await req.json();
    const data = removeSchema.parse(body);
    await removeFavorite(userId, data.type, data.externalId);
    return ok({ removed: true });
  } catch (error) {
    return handleError(error);
  }
}
