import { getVehicles } from "@/lib/data-access";
import VehiclesClientPage from "./VehiclesClientPage";

export default async function VehiclesPage() {
  const vehicles = await getVehicles();
  return <VehiclesClientPage initialVehicles={vehicles} />;
}
