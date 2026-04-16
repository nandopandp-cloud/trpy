import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ExpenseCategory } from '@trpy/database';
import { prisma } from '@/lib/prisma';
import { ok, err, handleError } from '@/lib/api';
import { getCurrentUserId } from '@/lib/auth-utils';

const createExpenseSchema = z.object({
  title: z.string().min(1).max(200),
  amount: z.number().positive(),
  category: z.nativeEnum(ExpenseCategory).default(ExpenseCategory.OTHER),
  date: z.string().datetime(),
  currency: z.string().length(3).default('BRL'),
  notes: z.string().max(500).optional(),
});

// GET /api/trips/[id]/expenses
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return err('Não autenticado', 401);

    const { searchParams } = req.nextUrl;
    const category = searchParams.get('category') as ExpenseCategory | null;

    const trip = await prisma.trip.findFirst({
      where: { id: params.id, userId, isDeleted: false },
    });
    if (!trip) return err('Viagem não encontrada', 404);

    const expenses = await prisma.expense.findMany({
      where: { tripId: params.id, ...(category ? { category } : {}) },
      orderBy: { date: 'desc' },
    });

    // Summary por categoria
    const summary = expenses.reduce(
      (acc, e) => {
        const cat = e.category;
        acc[cat] = (acc[cat] ?? 0) + Number(e.amount);
        return acc;
      },
      {} as Record<string, number>
    );

    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    return ok({ expenses, summary, total });
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/trips/[id]/expenses
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return err('Não autenticado', 401);

    const trip = await prisma.trip.findFirst({
      where: { id: params.id, userId, isDeleted: false },
    });
    if (!trip) return err('Viagem não encontrada', 404);

    const body = await req.json();
    const data = createExpenseSchema.parse(body);

    const [expense] = await prisma.$transaction([
      prisma.expense.create({
        data: {
          tripId: params.id,
          title: data.title,
          amount: data.amount,
          category: data.category,
          date: new Date(data.date),
          currency: data.currency,
          notes: data.notes,
        },
      }),
      prisma.$queryRawUnsafe(
        `UPDATE trips SET "totalSpent" = COALESCE((SELECT SUM(amount) FROM expenses WHERE "tripId" = $1), 0), "updatedAt" = NOW() WHERE id = $1`,
        params.id
      ),
    ]);

    return ok(expense, 201);
  } catch (error) {
    return handleError(error);
  }
}
