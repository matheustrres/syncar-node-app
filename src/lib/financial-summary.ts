import { prisma } from "./prisma";
import { getDataAccessSession } from "./data-access";
import { financialToday } from "./financial-filters";
import { getRedisCache, setRedisCache } from "./redis-cache";

export interface FinancialSummary {
  today: string;
  monthStart: string;
  overdue: { value: number; count: number };
  upcoming: { value: number; count: number };
  received: { value: number; count: number };
  expenses: { value: number; count: number };
  categories: string[];
}

export async function getFinancialSummary(): Promise<FinancialSummary | null> {
  const session = await getDataAccessSession();
  if (!session?.user?.id) return null;
  const userId = session.user.id;
  const cacheKey = `syncar:cache:financial:${userId}:summary:${financialToday().toISOString().slice(0, 10)}`;
  const cached = await getRedisCache<FinancialSummary>(cacheKey);
  if (cached.value) return cached.value;
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
  const result = { today: today.toISOString().slice(0, 10), monthStart: monthStart.toISOString().slice(0, 10),
    overdue: { value: overdue._sum.value || 0, count: overdue._count },
    upcoming: { value: upcoming._sum.value || 0, count: upcoming._count },
    received: { value: received._sum.value || 0, count: received._count },
    expenses: { value: expenses._sum.value || 0, count: expenses._count }, categories: categories.map(item => item.type) };
  await setRedisCache(cacheKey, result, cached);
  return result;
}
