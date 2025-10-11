import { getVehicles, getProfile } from "@/lib/data-access";
import VehiclesClientPage from "./VehiclesClientPage";

export default async function VehiclesPage() {
  const [{ vehicles, total }, profile] = await Promise.all([
    getVehicles(),
    getProfile(),
  ]);

  return (
    <VehiclesClientPage
      initialVehicles={vehicles}
      total={total}
      userPlan={profile?.plan || "BASIC"}
    />
  );
}
