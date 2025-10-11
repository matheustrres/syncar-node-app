import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const skip = (page - 1) * limit;
  const where: { [key: string]: unknown } = { userId: session.user.id };
  if (search) {
    where.plate = {
      contains: search,
      mode: "insensitive",
    };
  }
  if (status) {
    where.status = status;
  }
  const [vehicles, total] = await prisma.$transaction([
    prisma.vehicle.findMany({
      where,
      select: {
        id: true,
        plate: true,
        brand: true,
        model: true,
        year: true,
        status: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.vehicle.count({ where }),
  ]);
  return NextResponse.json({ vehicles, total });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (user?.plan === "BASIC") {
    const vehicleCount = await prisma.vehicle.count({
      where: { userId: session.user.id },
    });
    if (vehicleCount >= 3) {
      return NextResponse.json(
        {
          error: "Limite de veículos atingido. Faça o upgrade.",
        },
        { status: 403 }
      );
    }
  }
  const data = await request.json();
  const newVehicle = await prisma.vehicle.create({
    data: { ...data, userId: session.user.id },
  });
  return NextResponse.json(newVehicle, { status: 201 });
}
