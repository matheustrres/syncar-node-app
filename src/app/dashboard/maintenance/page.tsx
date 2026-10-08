import { getAllVehicles, getDataAccessSession, getMaintenance } from "@/lib/data-access";
import MaintenanceClientPage from "./MaintenanceClientPage";

export default async function MaintenancePage() {
  const session = await getDataAccessSession();
  const userPlan = session?.user?.plan || "BASIC"; // Default to BASIC if session or plan is not found

  const [{ maintenance, total }, vehicles] = await Promise.all([
    getMaintenance(),
    getAllVehicles(),
  ]);
  return (
    <MaintenanceClientPage
      initialMaintenance={maintenance}
      total={total}
      initialVehicles={vehicles}
      userPlan={userPlan}
    />
  );
}
