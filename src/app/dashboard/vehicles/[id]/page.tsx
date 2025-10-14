import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { notFound } from "next/navigation";
import VehicleDetailsClientPage from "./VehicleDetailsClientPage";

interface VehicleDetailsPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VehicleDetailsPage(
  props: VehicleDetailsPageProps
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return notFound();
  }

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
