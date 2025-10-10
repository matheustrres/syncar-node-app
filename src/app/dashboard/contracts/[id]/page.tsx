import { prisma } from "@/lib/prisma";
import ContractDetailsClientPage from "./ContractDetailsClientPage";
import { getVehicles, getDrivers } from "@/lib/data-access";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";

export default async function ContractDetailsPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notFound();
  const contract = await prisma.contract.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: { driver: true, vehicle: true },
  });
  if (!contract) notFound();
  const [vehicles, drivers] = await Promise.all([getVehicles(), getDrivers()]);
  return (
    <ContractDetailsClientPage
      id={params.id}
      initialContract={JSON.parse(JSON.stringify(contract))}
      initialVehicles={vehicles}
      initialDrivers={drivers}
    />
  );
}
