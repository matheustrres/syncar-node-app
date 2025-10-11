import {
  getContracts,
  getAllDrivers,
  getAllVehicles,
} from "@/lib/data-access";
import ContractsClientPage from "./ContractsClientPage";

export default async function ContractsPage() {
  const [{ contracts, total }, drivers, vehicles] = await Promise.all([
    getContracts(),
    getAllDrivers(),
    getAllVehicles(),
  ]);
  return (
    <ContractsClientPage
      initialContracts={contracts}
      total={total}
      initialDrivers={drivers}
      initialVehicles={vehicles}
    />
  );
}
