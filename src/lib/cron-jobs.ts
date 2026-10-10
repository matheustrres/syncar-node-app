import { PrismaClient, NotificationType } from "@prisma/client";

const prisma = new PrismaClient();

async function createNotification(notification: {
  userId: string;
  type: NotificationType;
  message: string;
  relatedEntityId: string;
}) {
  const existing = await prisma.notification.findFirst({
    where: {
      userId: notification.userId,
      type: notification.type,
      relatedEntityId: notification.relatedEntityId,
      isRead: false,
    },
  });
  if (!existing) {
    await prisma.notification.create({ data: notification });
    console.log(`Notification created: ${notification.type}`);
  }
}

export async function checkContractEndings() {
  console.log("\n--- Checking Contract Endings ---");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const fifteenDaysFromNow = new Date(today);
  fifteenDaysFromNow.setDate(today.getDate() + 15);
  console.log(`Today (normalized): ${today.toISOString()}`);
  console.log(`Fifteen Days From Now: ${fifteenDaysFromNow.toISOString()}`);
  const activeContracts = await prisma.contract.findMany({
    where: { status: "Ativo" },
    include: { driver: true },
  });
  console.log(`Found ${activeContracts.length} active contracts to check.`);
  for (const contract of activeContracts) {
    if (!contract.duration) continue;
    const startDate = new Date(contract.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + contract.duration * 7);
    const conditionMet = endDate >= today && endDate <= fifteenDaysFromNow;
    if (conditionMet) {
      const daysLeft = Math.ceil(
        (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      await createNotification({
        userId: contract.userId,
        type: "CONTRACT_ENDING",
        message: `O contrato com ${contract.driver.name} vence em ${daysLeft} dias.`,
        relatedEntityId: contract.id,
      });
    }
  }
}

export async function checkOverduePayments() {
  console.log("\n--- Checking Overdue Payments ---");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  console.log(`Today (normalized): ${today.toISOString()}`);
  const overduePayments = await prisma.payment.findMany({
    where: {
      status: "Pendente",
      dueDate: { lte: today },
    },
    include: { contract: { include: { driver: true } } },
  });
  console.log(`Found ${overduePayments.length} overdue payments to process.`);
  for (const payment of overduePayments) {
    await createNotification({
      userId: payment.contract.userId,
      type: "PAYMENT_OVERDUE",
      message: `O pagamento de ${payment.contract.driver.name} está atrasado.`,
      relatedEntityId: payment.contractId,
    });
  }
}

export async function checkUpcomingMaintenance() {
  console.log("\n--- Checking Upcoming Maintenance ---");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);

  const allUsers = await prisma.user.findMany({ select: { id: true } });

  for (const user of allUsers) {
    const upcomingMaintenance = await prisma.maintenance.findMany({
      where: {
        userId: user.id,
        OR: [
          {
            nextServiceDate: { gte: today, lte: sevenDaysFromNow },
          },
          {
            nextServiceMileage: {
              gte: 0, // Assuming mileage is always positive
              lte: 500, // Example: within 500km of next service mileage
            },
            // This part needs to be dynamic based on current vehicle mileage
            // For now, we'll just check if nextServiceMileage is set and within a range
            // A more robust solution would involve storing current vehicle mileage and comparing
          },
        ],
      },
      include: { vehicle: true },
    });

    for (const maintenance of upcomingMaintenance) {
      let message = `Manutenção de ${maintenance.type.toLowerCase()} para o veículo ${maintenance.vehicle.plate} - ${maintenance.vehicle.model} está próxima.`;

      if (maintenance.nextServiceDate && maintenance.nextServiceDate >= today && maintenance.nextServiceDate <= sevenDaysFromNow) {
        const daysLeft = Math.ceil((maintenance.nextServiceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        message += ` Vencimento em ${daysLeft} dias.`;
      }

      if (maintenance.nextServiceMileage && maintenance.nextServiceMileage > 0) {
        // This part is tricky without current vehicle mileage. For a real system,
        // we'd need to fetch the current mileage of the vehicle.
        // For now, we'll just indicate that a mileage reminder is set.
        message += ` Próxima revisão em ${maintenance.nextServiceMileage} KM.`;
      }

      await createNotification({
        userId: user.id,
        type: "MAINTENANCE_REMINDER",
        message,
        relatedEntityId: maintenance.id,
      });
    }
  }
}
