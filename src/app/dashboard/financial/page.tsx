import {
  getContracts,
  getDrivers,
  getVehicles,
  getPayments,
  getExpenses,
} from "@/lib/data-access";
import FinancialClientPage from "./FinancialClientPage";

export default async function FinancialPage() {
  const [contracts, drivers, vehicles, payments, expenses] = await Promise.all([
    getContracts(),
    getDrivers(),
    getVehicles(),
    getPayments(),
    getExpenses(),
  ]);
  return (
    <FinancialClientPage
      initialContracts={contracts}
      initialDrivers={drivers}
      initialVehicles={vehicles}
      initialPayments={payments}
      initialExpenses={expenses}
    />
  );
}
