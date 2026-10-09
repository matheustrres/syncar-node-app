import { getVehicles, getVehicleStatusCounts } from "@/lib/data-access";
import VehiclesClientPage from "./VehiclesClientPage";

export default async function VehiclesPage() {
  const [{ vehicles, total }, statusCounts] = await Promise.all([getVehicles(), getVehicleStatusCounts()]);

  return (
    <VehiclesClientPage
      initialVehicles={vehicles}
      total={total}
      initialStatusCounts={statusCounts}
    />
  );
}
