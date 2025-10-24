import { getContracts, getAllDrivers, getAllVehicles } from "@/lib/data-access";
import ContractsClientPage from "./ContractsClientPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export default async function ContractsPage() {
  const session = await getServerSession(authOptions);
  const userPlan = session?.user?.plan || "BASIC";
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
      userPlan={userPlan}
    />
  );
}
