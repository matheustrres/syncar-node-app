import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { notFound } from "next/navigation";
import VehicleDetailsClientPage from "./VehicleDetailsClientPage";

export default async function VehicleDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return notFound();
  }

  // Busca o veículo específico no servidor
  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (!vehicle) {
    notFound();
  }

  return (
    <VehicleDetailsClientPage
      id={params.id}
      initialVehicle={JSON.parse(JSON.stringify(vehicle))}
    />
  );
}
