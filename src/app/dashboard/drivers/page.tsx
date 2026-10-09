import { getDrivers, getDriverSummary } from "@/lib/data-access";
import DriversClientPage from "./DriversClientPage";

export default async function DriversPage() {
  const [{ drivers, total }, summary] = await Promise.all([getDrivers(), getDriverSummary()]);
  return (
    <DriversClientPage
      initialDrivers={drivers}
      total={total}
      initialSummary={summary}
    />
  );
}
