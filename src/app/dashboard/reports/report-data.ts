import type { OverduePaymentReportItem } from "@/types";

export function groupOverduePayments(payments: OverduePaymentReportItem[]) {
  const groups = new Map<string, OverduePaymentReportItem[]>();
  for (const payment of payments) {
    // Missing IDs from an older cache stay separate instead of merging namesakes.
    const key = payment.driverId || payment.id;
    groups.set(key, [...(groups.get(key) ?? []), payment]);
  }
  return [...groups.entries()].map(([id, payments]) => ({ id, name: payments[0].driverName, payments: [...payments].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()), total: payments.reduce((sum, item) => sum + Number(item.value), 0), days: Math.max(...payments.map(item => item.daysOverdue)) }));
}
