import {
  getPendingPayments,
  getPaidPayments,
  getRecentExpenses,
  getAllContracts,
  getAllDrivers,
  getAllVehicles,
} from "@/lib/data-access";
import FinancialClientPage from "./FinancialClientPage";

export default async function FinancialPage() {
  const [
    pendingPaymentsData,
    paidPaymentsData,
    recentExpensesData,
    contracts,
    drivers,
    vehicles,
  ] = await Promise.all([
    getPendingPayments(1, 10),
    getPaidPayments(1, 10),
    getRecentExpenses(1, 10),
    getAllContracts(),
    getAllDrivers(),
    getAllVehicles(),
  ]);
  return (
    <FinancialClientPage
      initialPendingPayments={pendingPaymentsData}
      initialPaidPayments={paidPaymentsData}
      initialRecentExpenses={recentExpensesData}
      initialContracts={contracts}
      initialDrivers={drivers}
      initialVehicles={vehicles}
    />
  );
}
