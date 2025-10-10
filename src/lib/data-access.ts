import { prisma } from "./prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";
import { Contract, Driver, Vehicle } from "@/types";

export async function getContracts() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  return prisma.contract.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  }) as unknown as Contract[];
}

export async function getDrivers() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  return prisma.driver.findMany({
    where: { userId: session.user.id },
  }) as unknown as Driver[];
}

export async function getVehicles() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  return prisma.vehicle.findMany({
    where: { userId: session.user.id },
  }) as unknown as Vehicle[];
}
