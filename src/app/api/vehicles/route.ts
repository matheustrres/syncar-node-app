import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

import { handlePrismaError } from "@/lib/api-utils";
import {
  getRedisCache,
  invalidateVehicleCaches,
  setRedisCache,
} from "@/lib/redis-cache";

import { normalizeString } from "@/lib/string-utils";
import {
  parseJsonBody,
  vehicleCreateSchema,
  vehicleIdsSchema,
  vehicleListQuerySchema,
} from "@/lib/vehicle-validation";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  for (const key of new Set(searchParams.keys())) {
    if (searchParams.getAll(key).length > 1) {
      return NextResponse.json({ error: `Parâmetro repetido: ${key}.` }, { status: 400 });
    }
  }
  const parsedQuery = vehicleListQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
  if (!parsedQuery.success) {
    return NextResponse.json({ error: parsedQuery.error.issues[0]?.message ?? "Filtros inválidos." }, { status: 400 });
  }
  const query = parsedQuery.data;
  const cacheKey = `syncar:cache:vehicles:${session.user.id}:api:${encodeURIComponent(JSON.stringify(query))}`;
  const cachedVehicles = await getRedisCache<{ vehicles: unknown[]; total: number }>(cacheKey);
  if (cachedVehicles.value) return NextResponse.json(cachedVehicles.value);
  const { page, limit, sortColumn, sortDirection } = query;
  const skip = (page - 1) * limit;
  const where: Prisma.VehicleWhereInput = { userId: session.user.id };
  for (const field of ["plate", "brand", "model"] as const) {
    const value = query[field];
    if (value) where[field] = { contains: value, mode: "insensitive" };
  }
  if (query.status) where.status = query.status;
  for (const field of ["year", "km"] as const) {
    const min = query[`${field}Min`];
    const max = query[`${field}Max`];
    if (min !== undefined || max !== undefined) {
      where[field] = { ...(min !== undefined ? { gte: min } : {}), ...(max !== undefined ? { lte: max } : {}) };
    }
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
  const result = { vehicles, total };
  await setRedisCache(cacheKey, result, cachedVehicles);
  return NextResponse.json(result);
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
  const parsedBody = await parseJsonBody(request, vehicleCreateSchema);
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error }, { status: 400 });
  }
  const data = parsedBody.data;
  try {
    const newVehicle = await prisma.vehicle.create({
      data: {
        ...data,
        renavam: data.renavam ?? null,
        chassis: data.chassis ?? null,
        userId: session.user.id,
        plateNormalized: normalizeString(data.plate),
        modelNormalized: normalizeString(data.model),
      },
    });
    await invalidateVehicleCaches(session.user.id);
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
  const parsedBody = await parseJsonBody(request, vehicleIdsSchema);
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error },
      { status: 400 }
    );
  }
  const ids = parsedBody.data.ids;
  try {
    await prisma.vehicle.deleteMany({
      where: {
        id: {
          in: ids,
        },
        userId: session.user.id,
      },
    });
    await invalidateVehicleCaches(session.user.id);
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
