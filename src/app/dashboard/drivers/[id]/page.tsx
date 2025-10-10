import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { notFound } from "next/navigation";
import DriverDetailsClientPage from "./DriverDetailsClientPage";

export default async function DriverDetailsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return notFound();
  }
  const params = await props.params;
  const driver = await prisma.driver.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });
  if (!driver) notFound();
  return (
    <DriverDetailsClientPage
      id={params.id}
      initialDriver={JSON.parse(JSON.stringify(driver))}
    />
  );
}
