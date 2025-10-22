
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding with existing user...');

  // 1. Find the oldest user
  const user = await prisma.user.findFirst({
    orderBy: {
      createdAt: 'asc',
    },
  });

  if (!user) {
    console.error('Seeding failed: No user found in the database. Please create a user first.');
    process.exit(1);
  }

  console.log(`Found user: ${user.name} (${user.email}). Seeding data for this user.`);

  // 2. Clean up existing data for this user
  await prisma.notification.deleteMany({ where: { userId: user.id } });
  await prisma.expense.deleteMany({ where: { userId: user.id } });
  await prisma.contract.deleteMany({ where: { userId: user.id } }); // This cascades to payments
  await prisma.vehicle.deleteMany({ where: { userId: user.id } });
  await prisma.driver.deleteMany({ where: { userId: user.id } });
  console.log(`Previous data for user ${user.id} cleaned.`);

  // 3. Create Vehicles
  const vehicles = await Promise.all([
    prisma.vehicle.create({ data: { brand: 'Fiat', model: 'Mobi', year: 2023, color: 'Branco', plate: 'RND1A23', renavam: '11111111111', chassis: '1A', km: 15000, userId: user.id } }),
    prisma.vehicle.create({ data: { brand: 'Hyundai', model: 'HB20', year: 2023, color: 'Prata', plate: 'RNE2B34', renavam: '22222222222', chassis: '2B', km: 25000, userId: user.id } }),
    prisma.vehicle.create({ data: { brand: 'Chevrolet', model: 'Onix', year: 2022, color: 'Preto', plate: 'RNF3C45', renavam: '33333333333', chassis: '3C', km: 45000, userId: user.id } }),
    prisma.vehicle.create({ data: { brand: 'Volkswagen', model: 'Gol', year: 2021, color: 'Vermelho', plate: 'RNG4D56', renavam: '44444444444', chassis: '4D', km: 80000, userId: user.id, status: 'Manutenção' } }),
    prisma.vehicle.create({ data: { brand: 'Fiat', model: 'Argo', year: 2023, color: 'Cinza', plate: 'RNH5E67', renavam: '55555555555', chassis: '5E', km: 12000, userId: user.id } }),
  ]);
  console.log(`Created ${vehicles.length} vehicles.`);

  // 4. Create Drivers
  const drivers = await Promise.all([
    prisma.driver.create({ data: { name: 'João Silva', cpf: '111.111.111-11', phone: '11911111111', email: 'joao.silva@example.com', cnh: '11111111111', cnhValidity: new Date('2030-01-01'), userId: user.id } }),
    prisma.driver.create({ data: { name: 'Maria Oliveira', cpf: '222.222.222-22', phone: '11922222222', email: 'maria.oliveira@example.com', cnh: '22222222222', cnhValidity: new Date('2028-05-20'), userId: user.id } }),
    prisma.driver.create({ data: { name: 'Carlos Pereira', cpf: '333.333.333-33', phone: '11933333333', email: 'carlos.pereira@example.com', cnh: '33333333333', cnhValidity: new Date('2032-10-15'), userId: user.id } }),
    prisma.driver.create({ data: { name: 'Ana Costa', cpf: '444.444.444-44', phone: '11944444444', email: 'ana.costa@example.com', cnh: '44444444444', cnhValidity: new Date('2029-07-30'), userId: user.id, status: 'Inativo' } }),
  ]);
  console.log(`Created ${drivers.length} drivers.`);

  // 5. Create Contracts and Payments
  console.log('Creating contracts and payments...');
  const today = new Date();

  // ... (contract and payment creation logic remains the same)
  const contract1StartDate = new Date();
  contract1StartDate.setDate(today.getDate() - (4 * 7)); // Started 4 weeks ago
  const contract1 = await prisma.contract.create({
    data: {
      weeklyValue: 750,
      paymentDay: 'Segunda-feira',
      startDate: contract1StartDate,
      deposit: 1500,
      duration: 5,
      userId: user.id,
      vehicleId: vehicles[0].id,
      driverId: drivers[0].id,
    },
  });
  const preciseStartDate1 = new Date();
  preciseStartDate1.setDate(today.getDate() - (35 - 10));
  await prisma.contract.update({ where: { id: contract1.id }, data: { startDate: preciseStartDate1 } });

  const contract2StartDate = new Date();
  contract2StartDate.setDate(today.getDate() - (10 * 7));
  const contract2 = await prisma.contract.create({
    data: {
      weeklyValue: 800,
      paymentDay: 'Terça-feira',
      startDate: contract2StartDate,
      deposit: 1600,
      duration: 20,
      userId: user.id,
      vehicleId: vehicles[1].id,
      driverId: drivers[1].id,
    },
  });
  await prisma.payment.create({
    data: {
      contractId: contract2.id,
      weekStart: new Date(new Date().setDate(today.getDate() - 14)),
      weekEnd: new Date(new Date().setDate(today.getDate() - 8)),
      value: 800,
      dueDate: new Date(new Date().setDate(today.getDate() - 7)),
      status: 'Pendente',
    },
  });
  await prisma.payment.create({
    data: {
      contractId: contract2.id,
      weekStart: new Date(new Date().setDate(today.getDate() - 7)),
      weekEnd: new Date(new Date().setDate(today.getDate() - 1)),
      value: 800,
      dueDate: new Date(new Date().setDate(today.getDate() + 1)),
      status: 'Pendente',
    },
  });

  // ... (other contracts)

  // 6. Create Expenses
  console.log('Creating expenses...');
  const expenses = [];
  const expenseTypes = ["Manutenção", "IPVA", "Seguro", "Documentação", "Multa", "Outros"];
  for (const vehicle of vehicles) {
    const numExpenses = Math.floor(Math.random() * 6) + 5; // 5 to 10 expenses per vehicle
    for (let i = 0; i < numExpenses; i++) {
      const randomType = expenseTypes[Math.floor(Math.random() * expenseTypes.length)];
      const randomValue = Math.random() * 500 + 50;
      const randomMonth = Math.floor(Math.random() * 12);
      const randomDay = Math.floor(Math.random() * 28) + 1;
      const expenseDate = new Date(today.getFullYear(), randomMonth, randomDay);

      expenses.push({
        type: randomType,
        description: `Despesa de ${randomType.toLowerCase()} para ${vehicle.model}`,
        value: randomValue,
        date: expenseDate,
        userId: user.id,
        vehicleId: vehicle.id,
      });
    }
  }
  await prisma.expense.createMany({ data: expenses });
  console.log(`Created ${expenses.length} expenses.`);

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('An error occurred during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
