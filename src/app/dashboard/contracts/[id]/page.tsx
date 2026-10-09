import { prisma } from "@/lib/prisma";
import ContractDetailsClientPage from "./ContractDetailsClientPage";
import { getAllVehicles, getAllDrivers } from "@/lib/data-access";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth";
import { contractIdSchema } from "@/lib/contract-validation";

interface ContractDetailsPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ContractDetailsPage({
  params,
}: ContractDetailsPageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return notFound();
  const { id } = await params;
  if (!contractIdSchema.safeParse(id).success) notFound();
  const contract = await prisma.contract.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
    include: { driver: true, vehicle: true },
  });
  if (!contract) notFound();
  const [vehicles, drivers] = await Promise.all([
    getAllVehicles(),
    getAllDrivers(),
  ]);
  return (
    <ContractDetailsClientPage
      id={id}
      initialContract={JSON.parse(JSON.stringify(contract))}
      initialVehicles={vehicles}
      initialDrivers={drivers}
    />
  );
}
