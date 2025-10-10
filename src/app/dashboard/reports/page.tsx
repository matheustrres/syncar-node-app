import {
  getContracts,
  getDrivers,
  getVehicles,
  getPayments,
  getExpenses,
} from "@/lib/data-access";
import ReportsClientPage from "./ReportsClientPage";

export default async function ReportsPage() {
  const [contracts, drivers, vehicles, payments, expenses] = await Promise.all([
    getContracts(),
    getDrivers(),
    getVehicles(),
    getPayments(),
    getExpenses(),
  ]);
  return (
    <ReportsClientPage
      initialContracts={contracts}
      initialDrivers={drivers}
      initialVehicles={vehicles}
      initialPayments={payments}
      initialExpenses={expenses}
    />
  );
}
