import {
  getPendingPayments,
  getPaidPayments,
  getRecentExpenses,
} from "@/lib/data-access";
import FinancialClientPage from "./FinancialClientPage";

export default async function FinancialPage() {
  const [
    pendingPaymentsData,
    paidPaymentsData,
    recentExpensesData,
  ] = await Promise.all([
    getPendingPayments(1, 10),
    getPaidPayments(1, 10),
    getRecentExpenses(1, 10),
  ]);
  return (
    <FinancialClientPage
      initialPendingPayments={pendingPaymentsData}
      initialPaidPayments={paidPaymentsData}
      initialRecentExpenses={recentExpensesData}
    />
  );
}
