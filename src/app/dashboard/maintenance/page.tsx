import { getAllVehicles, getDataAccessSession, getMaintenance, getMaintenanceSummary } from "@/lib/data-access";
import MaintenanceClientPage from "./MaintenanceClientPage";

export default async function MaintenancePage() {
  const session = await getDataAccessSession();
  const userPlan = session?.user?.plan || "BASIC"; // Default to BASIC if session or plan is not found

  const [{ maintenance, total }, vehicles, summary] = await Promise.all([
    getMaintenance(),
    getAllVehicles(),
    getMaintenanceSummary(),
  ]);
  return (
    <MaintenanceClientPage
      initialMaintenance={maintenance}
      total={total}
      initialVehicles={vehicles}
      initialSummary={summary}
      userPlan={userPlan}
    />
  );
}
