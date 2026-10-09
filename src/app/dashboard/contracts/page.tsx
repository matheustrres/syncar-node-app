import { getContracts, getAllDrivers, getAllVehicles, getDataAccessSession, getContractSummary, getContractsEndingSoon } from "@/lib/data-access";
import ContractsClientPage from "./ContractsClientPage";

export default async function ContractsPage() {
  const [session, { contracts, total }, drivers, vehicles, summary, endingSoon] = await Promise.all([
    getDataAccessSession(),
    getContracts(),
    getAllDrivers(),
    getAllVehicles(),
    getContractSummary(),
    getContractsEndingSoon(),
  ]);
  const userPlan = session?.user?.plan || "BASIC";
  return (
    <ContractsClientPage
      initialContracts={contracts}
      total={total}
      initialDrivers={drivers}
      initialVehicles={vehicles}
      userPlan={userPlan}
      initialSummary={summary}
      endingSoon={endingSoon}
    />
  );
}
