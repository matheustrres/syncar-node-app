import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('No users found. Please create a user first.');
    return;
  }

  const vehicles = await prisma.vehicle.findMany({
    where: { userId: user.id },
  });

  if (vehicles.length === 0) {
    console.error('No vehicles found for the user. Please create a vehicle first.');
    return;
  }

  console.log(`Seeding expenses for user ${user.id}`);

  // Clear existing expenses for the user
  await prisma.expense.deleteMany({ where: { userId: user.id } });

  const expenses = [];
  const expenseTypes = ['Manutenção', 'Abastecimento', 'Seguro', 'Limpeza', 'Multa'];

  for (const vehicle of vehicles) {
    for (let i = 0; i < 10; i++) {
      const randomType = expenseTypes[Math.floor(Math.random() * expenseTypes.length)];
      const randomValue = Math.random() * 500 + 50;
      const randomMonth = Math.floor(Math.random() * 6) + 5; // May to October
      const randomDay = Math.floor(Math.random() * 28) + 1;
      const expenseDate = new Date(`2025-${String(randomMonth).padStart(2, '0')}-${String(randomDay).padStart(2, '0')}`);

      expenses.push({
        type: randomType,
        description: `Despesa aleatória para ${vehicle.model}`,
        value: randomValue,
        date: expenseDate,
        userId: user.id,
        vehicleId: vehicle.id,
      });
    }
  }

  await prisma.expense.createMany({ data: expenses });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });