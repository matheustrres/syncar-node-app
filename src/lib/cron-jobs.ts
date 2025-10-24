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
    console.log(`--> Notificação criada: ${notification.message}`);
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
    console.log(`\n  Contract ID: ${contract.id}`);
    console.log(`  Start Date: ${startDate.toISOString()}`);
    console.log(`  Duration (weeks): ${contract.duration}`);
    console.log(`  Calculated End Date: ${endDate.toISOString()}`);
    console.log(
      `  Condition Met (endDate >= today && endDate <= fifteenDaysFromNow): ${conditionMet}`
    );
    if (conditionMet) {
      const daysLeft = Math.ceil(
        (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      await createNotification({
        userId: contract.userId,
        type: "CONTRACT_ENDING",
        message: `O contrato com ${contract.driver.name} vence em ${daysLeft} dias`,
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
    console.log(`\n  Processing Payment ID: ${payment.id}`);
    console.log(`  Due Date: ${payment.dueDate.toISOString()}`);
    await createNotification({
      userId: payment.contract.userId,
      type: "PAYMENT_OVERDUE",
      message: `O pagamento de ${payment.contract.driver.name} está atrasado`,
      relatedEntityId: payment.contractId,
    });
  }
}
