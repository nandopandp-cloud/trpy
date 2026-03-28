import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ItemType } from '@trpy/database';
import { prisma } from '@/lib/prisma';
import { ok, err, handleError } from '@/lib/api';

const addItemSchema = z.object({
  dayId: z.string(),
  type: z.nativeEnum(ItemType).default(ItemType.ACTIVITY),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  durationMins: z.number().int().positive().optional(),
  cost: z.number().nonnegative().optional(),
  order: z.number().int().default(0),
});

const addDaySchema = z.object({
  dayNumber: z.number().int().positive(),
  date: z.string().datetime(),
  title: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

async function getOrCreateDemoUser() {
  return prisma.user.upsert({
    where: { email: 'demo@trpy.app' },
    update: {},
    create: { email: 'demo@trpy.app', name: 'Demo User' },
  });
}

// GET /api/trips/[id]/itinerary
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getOrCreateDemoUser();

    const trip = await prisma.trip.findFirst({
      where: { id: params.id, userId: user.id, isDeleted: false },
    });
    if (!trip) return err('Viagem não encontrada', 404);

    const days = await prisma.itineraryDay.findMany({
      where: { tripId: params.id },
      orderBy: { dayNumber: 'asc' },
      include: { items: { orderBy: { order: 'asc' } } },
    });

    return ok(days);
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/trips/[id]/itinerary — adicionar dia ou item
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getOrCreateDemoUser();

    const trip = await prisma.trip.findFirst({
      where: { id: params.id, userId: user.id, isDeleted: false },
    });
    if (!trip) return err('Viagem não encontrada', 404);

    const body = await req.json();

    // Se tiver dayId, é um item; caso contrário, é um novo dia
    if (body.dayId) {
      const data = addItemSchema.parse(body);
      const day = await prisma.itineraryDay.findFirst({
        where: { id: data.dayId, tripId: params.id },
      });
      if (!day) return err('Dia não encontrado', 404);

      const item = await prisma.itineraryItem.create({
        data: {
          dayId: data.dayId,
          type: data.type,
          title: data.title,
          description: data.description,
          location: data.location,
          startTime: data.startTime,
          durationMins: data.durationMins,
          cost: data.cost,
          order: data.order,
        },
      });
      return ok(item, 201);
    } else {
      const data = addDaySchema.parse(body);
      const day = await prisma.itineraryDay.create({
        data: {
          tripId: params.id,
          dayNumber: data.dayNumber,
          date: new Date(data.date),
          title: data.title,
          notes: data.notes,
        },
        include: { items: true },
      });
      return ok(day, 201);
    }
  } catch (error) {
    return handleError(error);
  }
}
