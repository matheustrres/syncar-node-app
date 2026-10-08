import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
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
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10) || 10));
  const sortableColumns = ["createdAt", "plate", "brand", "model", "status"] as const;
  const requestedSort = searchParams.get("sortColumn");
  const sortColumn = sortableColumns.find((column) => column === requestedSort) || "createdAt";
  const sortDirection = searchParams.get("sortDirection") === "asc" ? "asc" : "desc";
  const skip = (page - 1) * limit;
  const where: Prisma.VehicleWhereInput = { userId: session.user.id };
  for (const field of ["plate", "brand", "model"] as const) {
    const value = searchParams.get(field);
    if (value) where[field] = { contains: value, mode: "insensitive" };
  }
  const status = searchParams.get("status");
  if (status) where.status = status;
  for (const field of ["year", "km"] as const) {
    const min = searchParams.get(`${field}Min`);
    const max = searchParams.get(`${field}Max`);
    const range: { gte?: number; lte?: number } = {};
    if (min && /^\d+$/.test(min)) range.gte = Number(min);
    if (max && /^\d+$/.test(max)) range.lte = Number(max);
    if (Object.keys(range).length > 0) where[field] = range;
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
  if (session.user.plan === "BASIC") {
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

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { ids } = await request.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { error: "IDs inválidos fornecidos." },
      { status: 400 }
    );
  }
  try {
    await prisma.vehicle.deleteMany({
      where: {
        id: {
          in: ids,
        },
        userId: session.user.id,
      },
    });
    return NextResponse.json(
      { message: "Veículos excluídos com sucesso." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao excluir veículos:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao excluir os veículos." },
      { status: 500 }
    );
  }
}
