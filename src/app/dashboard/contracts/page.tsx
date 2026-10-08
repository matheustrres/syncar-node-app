import { getContracts, getAllDrivers, getAllVehicles, getDataAccessSession } from "@/lib/data-access";
import ContractsClientPage from "./ContractsClientPage";

export default async function ContractsPage() {
  const [session, { contracts, total }, drivers, vehicles] = await Promise.all([
    getDataAccessSession(),
    getContracts(),
    getAllDrivers(),
    getAllVehicles(),
  ]);
  const userPlan = session?.user?.plan || "BASIC";
  return (
    <ContractsClientPage
      initialContracts={contracts}
      total={total}
      initialDrivers={drivers}
      initialVehicles={vehicles}
      userPlan={userPlan}
    />
  );
}
