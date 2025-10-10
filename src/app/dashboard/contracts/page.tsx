import { getContracts, getDrivers, getVehicles } from "@/lib/data-access";
import ContractsClientPage from "./ContractsClientPage";

export default async function ContractsPage() {
  const [contracts, drivers, vehicles] = await Promise.all([
    getContracts(),
    getDrivers(),
    getVehicles(),
  ]);
  return (
    <ContractsClientPage
      initialContracts={contracts}
      initialDrivers={drivers}
      initialVehicles={vehicles}
    />
  );
}
