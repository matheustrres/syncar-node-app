import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

import { handlePrismaError } from "@/lib/api-utils";

import { normalizeString } from "@/lib/string-utils";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const sortColumn = searchParams.get("sortColumn") || "createdAt";
  const sortDirection = searchParams.get("sortDirection") || "desc";
  const skip = (page - 1) * limit;
  const where: { [key: string]: unknown } = { userId: session.user.id };
  // Parse advanced filters
  searchParams.forEach((value, key) => {
    if (
      key === "page" ||
      key === "limit" ||
      key === "sortColumn" ||
      key === "sortDirection"
    )
      return;
    // Text filters
    if (["plate", "brand", "model"].includes(key)) {
      if (value) {
        where[key] = {
          contains: value,
          mode: "insensitive",
        };
      }
    }
    // Select filters
    if (key === "status") {
      if (value) {
        where.status = value;
      }
    }
    // Number range filters
    if (key.endsWith("Min")) {
      const field = key.replace("Min", "");
      if (value) {
        where[field] = { ...where[field]!, gte: parseInt(value, 10) };
      }
    }
    if (key.endsWith("Max")) {
      const field = key.replace("Max", "");
      if (value) {
        where[field] = { ...where[field]!, lte: parseInt(value, 10) };
      }
    }
  });
  const [vehicles, total] = await prisma.$transaction([
    prisma.vehicle.findMany({
      where,
      select: {
        id: true,
        plate: true,
        brand: true,
        model: true,
        year: true,
        color: true,
        renavam: true,
        chassis: true,
        km: true,
        status: true,
      },
      skip,
      take: limit,
      orderBy: { [sortColumn]: sortDirection },
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
  try {
    const newVehicle = await prisma.vehicle.create({
      data: {
        ...data,
        userId: session.user.id,
        plateNormalized: normalizeString(data.plate),
        modelNormalized: normalizeString(data.model),
      },
    });
    return NextResponse.json(newVehicle, { status: 201 });
  } catch (error: unknown) {
    return handlePrismaError(
      error,
      {
        plate: "A placa informada já está em uso.",
        renavam: "O RENAVAM informado já está em uso.",
        chassis: "O chassi informado já está em uso.",
      },
      "Ocorreu um erro ao criar o veículo."
    );
  }
}
