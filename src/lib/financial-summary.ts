import { prisma } from "./prisma";
import { getDataAccessSession } from "./data-access";
import { financialToday } from "./financial-filters";

export async function getFinancialSummary() {
  const session = await getDataAccessSession();
  if (!session?.user?.id) return null;
  const userId = session.user.id;
  const today = financialToday();
  const weekEnd = new Date(today.getTime() + 7 * 86400000);
  const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
  const tomorrow = new Date(today.getTime() + 86400000);
  const [overdue, upcoming, received, expenses, categories] = await prisma.$transaction([
    prisma.payment.aggregate({ where: { contract: { userId }, status: "Pendente", dueDate: { lt: today } }, _sum: { value: true }, _count: true }),
    prisma.payment.aggregate({ where: { contract: { userId }, status: "Pendente", dueDate: { gte: today, lt: weekEnd } }, _sum: { value: true }, _count: true }),
    prisma.payment.aggregate({ where: { contract: { userId }, status: "Pago", paymentDate: { gte: monthStart, lt: tomorrow } }, _sum: { value: true }, _count: true }),
    prisma.expense.aggregate({ where: { userId, date: { gte: monthStart, lt: tomorrow } }, _sum: { value: true }, _count: true }),
    prisma.expense.findMany({ where: { userId }, distinct: ['type'], select: { type: true }, orderBy: { type: 'asc' } }),
  ]);
  return { today: today.toISOString().slice(0, 10), monthStart: monthStart.toISOString().slice(0, 10),
    overdue: { value: overdue._sum.value || 0, count: overdue._count },
    upcoming: { value: upcoming._sum.value || 0, count: upcoming._count },
    received: { value: received._sum.value || 0, count: received._count },
    expenses: { value: expenses._sum.value || 0, count: expenses._count }, categories: categories.map(item => item.type) };
}
export type FinancialSummary = Awaited<ReturnType<typeof getFinancialSummary>>;
