import { getDrivers, getProfile } from "@/lib/data-access";
import DriversClientPage from "./DriversClientPage";

export default async function DriversPage() {
  const [{ drivers, total }, profile] = await Promise.all([
    getDrivers(),
    getProfile(),
  ]);
  return (
    <DriversClientPage
      initialDrivers={drivers}
      total={total}
      userPlan={profile?.plan || "BASIC"}
    />
  );
}
