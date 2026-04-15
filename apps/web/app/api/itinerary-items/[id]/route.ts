import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ItemType } from '@trpy/database';
import { prisma } from '@/lib/prisma';
import { ok, err, handleError } from '@/lib/api';

const updateSchema = z.object({
  type: z.nativeEnum(ItemType).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  durationMins: z.number().int().positive().optional().nullable(),
  cost: z.number().nonnegative().optional().nullable(),
  currency: z.string().length(3).optional(),
  order: z.number().int().optional(),
});

// PUT /api/itinerary-items/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = updateSchema.parse(body);

    const item = await prisma.itineraryItem.update({
      where: { id: params.id },
      data,
    });

    return ok(item);
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/itinerary-items/[id]
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const existing = await prisma.itineraryItem.findUnique({ where: { id: params.id } });
    if (!existing) return err('Item não encontrado', 404);

    await prisma.itineraryItem.delete({ where: { id: params.id } });
    return ok({ id: params.id });
  } catch (error) {
    return handleError(error);
  }
}
