import { prisma } from '@/lib/prisma';
import { FavoriteType } from '@trpy/database';

export interface AddFavoriteInput {
  userId: string;
  type: FavoriteType;
  externalId: string;
  name: string;
  image?: string;
  rating?: number;
  googlePlaceId?: string;
  youtubeVideoId?: string;
  pinterestPinId?: string;
  metadata?: Record<string, unknown>;
}

export async function addFavorite(input: AddFavoriteInput) {
  const { metadata, ...rest } = input;
  return prisma.favorite.upsert({
    where: {
      userId_type_externalId: {
        userId: input.userId,
        type: input.type,
        externalId: input.externalId,
      },
    },
    create: {
      ...rest,
      rating: input.rating !== undefined ? input.rating : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metadata: metadata ? (metadata as any) : undefined,
    },
    update: {
      name: input.name,
      image: input.image,
      rating: input.rating !== undefined ? input.rating : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metadata: metadata ? (metadata as any) : undefined,
      updatedAt: new Date(),
    },
  });
}

export async function removeFavorite(userId: string, type: FavoriteType, externalId: string) {
  return prisma.favorite.deleteMany({
    where: { userId, type, externalId },
  });
}

export async function isFavorited(
  userId: string,
  type: FavoriteType,
  externalId: string,
): Promise<boolean> {
  const count = await prisma.favorite.count({
    where: { userId, type, externalId },
  });
  return count > 0;
}

export async function getFavoritesByType(userId: string, type: FavoriteType) {
  return prisma.favorite.findMany({
    where: { userId, type },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllFavorites(userId: string) {
  return prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getFavoriteStats(userId: string) {
  const groups = await prisma.favorite.groupBy({
    by: ['type'],
    where: { userId },
    _count: { _all: true },
  });

  const stats: Record<string, number> = {};
  for (const g of groups) {
    stats[g.type] = g._count._all;
  }
  return stats;
}
