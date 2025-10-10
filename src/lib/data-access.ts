import { cache } from "react";
import { prisma } from "./prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";
import { Contract, Driver, Expense, Payment, User, Vehicle } from "@/types";

export const getContracts = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  return prisma.contract.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  }) as unknown as Contract[];
});

export const getDrivers = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  return prisma.driver.findMany({
    where: { userId: session.user.id },
  }) as unknown as Driver[];
});

export const getVehicles = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  return prisma.vehicle.findMany({
    where: { userId: session.user.id },
  }) as unknown as Vehicle[];
});

export const getPayments = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  return prisma.payment.findMany({
    where: { contract: { userId: session.user.id } },
    orderBy: { dueDate: "asc" },
  }) as unknown as Payment[];
});

export const getExpenses = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];
  return prisma.expense.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
  }) as unknown as Expense[];
});

export const getProfile = cache(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, companyName: true },
  }) as unknown as User;
});
