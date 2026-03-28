import { prisma, TripStatus, ExpenseCategory, ItemType } from './index';

async function main() {
  console.log('🌱 Seeding database...');

  // Usuário de teste
  const user = await prisma.user.upsert({
    where: { email: 'demo@trpy.app' },
    update: {},
    create: {
      email: 'demo@trpy.app',
      name: 'Demo User',
    },
  });

  // Viagem de exemplo
  const trip = await prisma.trip.upsert({
    where: { id: 'seed-trip-1' },
    update: {},
    create: {
      id: 'seed-trip-1',
      userId: user.id,
      title: 'Viagem a Lisboa',
      destination: 'Lisboa, Portugal',
      description: 'Uma semana explorando a capital portuguesa.',
      startDate: new Date('2025-06-01'),
      endDate: new Date('2025-06-07'),
      budget: 5000,
      totalSpent: 1200,
      status: TripStatus.PLANNING,
    },
  });

  // Dia 1 do itinerário
  const day1 = await prisma.itineraryDay.upsert({
    where: { tripId_dayNumber: { tripId: trip.id, dayNumber: 1 } },
    update: {},
    create: {
      tripId: trip.id,
      dayNumber: 1,
      date: new Date('2025-06-01'),
      title: 'Chegada e Alfama',
    },
  });

  await prisma.itineraryItem.createMany({
    skipDuplicates: true,
    data: [
      {
        dayId: day1.id,
        type: ItemType.TRANSPORT,
        title: 'Voo GRU → LIS',
        startTime: '08:00',
        durationMins: 720,
        order: 0,
      },
      {
        dayId: day1.id,
        type: ItemType.HOTEL,
        title: 'Check-in Hotel Bairro Alto',
        location: 'Bairro Alto, Lisboa',
        startTime: '16:00',
        order: 1,
      },
      {
        dayId: day1.id,
        type: ItemType.RESTAURANT,
        title: 'Jantar — Tasca do Chico',
        location: 'Alfama, Lisboa',
        startTime: '20:00',
        cost: 45,
        order: 2,
      },
    ],
  });

  // Despesas
  await prisma.expense.createMany({
    skipDuplicates: true,
    data: [
      {
        tripId: trip.id,
        category: ExpenseCategory.TRANSPORT,
        title: 'Passagem aérea',
        amount: 800,
        date: new Date('2025-05-01'),
      },
      {
        tripId: trip.id,
        category: ExpenseCategory.ACCOMMODATION,
        title: 'Hotel Bairro Alto (7 noites)',
        amount: 400,
        date: new Date('2025-05-10'),
      },
    ],
  });

  console.log('✅ Seed concluído!');
  console.log(`   Usuário: ${user.email}`);
  console.log(`   Viagem: ${trip.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
