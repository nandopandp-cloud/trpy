import { NextRequest } from 'next/server';
import { z } from 'zod';
import { ExpenseCategory } from '@trpy/database';
import { prisma } from '@/lib/prisma';
import { ok, err, handleError } from '@/lib/api';
import { getCurrentUserId } from '@/lib/auth-utils';

const updateExpenseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  amount: z.number().positive().optional(),
  category: z.nativeEnum(ExpenseCategory).optional(),
  date: z.string().datetime().optional(),
  notes: z.string().max(500).nullable().optional(),
});

async function recalcTotalSpent(tripId: string) {
  const agg = await prisma.expense.aggregate({
    where: { tripId },
    _sum: { amount: true },
  });
  await prisma.trip.update({
    where: { id: tripId },
    data: { totalSpent: agg._sum.amount ?? 0 },
  });
}

// PUT /api/expenses/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return err('Não autenticado', 401);

    const expense = await prisma.expense.findFirst({
      where: { id: params.id },
      include: { trip: { select: { userId: true } } },
    });
    if (!expense || expense.trip.userId !== userId) return err('Despesa não encontrada', 404);

    const body = await req.json();
    const data = updateExpenseSchema.parse(body);

    const updated = await prisma.expense.update({
      where: { id: params.id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.category && { category: data.category }),
        ...(data.date && { date: new Date(data.date) }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    await recalcTotalSpent(expense.tripId);
    return ok(updated);
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/expenses/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return err('Não autenticado', 401);

    const expense = await prisma.expense.findFirst({
      where: { id: params.id },
      include: { trip: { select: { userId: true } } },
    });
    if (!expense || expense.trip.userId !== userId) return err('Despesa não encontrada', 404);

    await prisma.expense.delete({ where: { id: params.id } });
    await recalcTotalSpent(expense.tripId);

    return ok({ deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
