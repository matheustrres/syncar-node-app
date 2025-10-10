import { getDrivers } from "@/lib/data-access";
import DriversClientPage from "./DriversClientPage";

export default async function DriversPage() {
  const drivers = await getDrivers();
  return <DriversClientPage initialDrivers={drivers} />;
}
