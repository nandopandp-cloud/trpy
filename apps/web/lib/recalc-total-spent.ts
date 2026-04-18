import { prisma } from '@/lib/prisma';
import { convertAmount } from '@/lib/currency';

/**
 * Recalculates trip.totalSpent by summing all expenses and itinerary item costs,
 * converting each to the trip's base currency before summing.
 */
export async function recalcTotalSpent(tripId: string): Promise<void> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: {
      currency: true,
      expenses: { select: { amount: true, currency: true } },
      itineraryDays: {
        select: {
          items: { select: { cost: true, currency: true } },
        },
      },
    },
  });

  if (!trip) return;

  const tripCurrency = trip.currency ?? 'BRL';
  let total = 0;

  for (const expense of trip.expenses) {
    total += await convertAmount(Number(expense.amount), expense.currency ?? 'BRL', tripCurrency);
  }

  for (const day of trip.itineraryDays) {
    for (const item of day.items) {
      if (item.cost != null && Number(item.cost) > 0) {
        total += await convertAmount(Number(item.cost), item.currency ?? 'BRL', tripCurrency);
      }
    }
  }

  await prisma.trip.update({
    where: { id: tripId },
    data: { totalSpent: total, updatedAt: new Date() },
  });
}
