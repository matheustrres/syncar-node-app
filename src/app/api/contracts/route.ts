import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

import { normalizeString } from "@/lib/string-utils";
import { Prisma } from "@prisma/client";
import { contractBodySchema, contractIdsSchema, contractListQuerySchema, parseContractJson } from "@/lib/contract-validation";
import { getRedisCache, invalidateContractCaches, invalidateVehicleCaches, setRedisCache } from "@/lib/redis-cache";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const queryInput: Record<string, string> = {};
  for (const [key, value] of searchParams) {
    if (queryInput[key] !== undefined) return NextResponse.json({ error: `Parâmetro repetido: ${key}.` }, { status: 400 });
    queryInput[key] = value;
  }
  const parsedQuery = contractListQuerySchema.safeParse(queryInput);
  if (!parsedQuery.success) return NextResponse.json({ error: parsedQuery.error.issues[0]?.message ?? "Filtros inválidos." }, { status: 400 });
  const cacheKey = `syncar:cache:contracts:${session.user.id}:api:${encodeURIComponent(JSON.stringify(parsedQuery.data))}`;
  const cachedContracts = await getRedisCache<unknown>(cacheKey);
  if (cachedContracts.value) return NextResponse.json(cachedContracts.value);
  const { page, limit, sortColumn, sortDirection, driverName, vehiclePlate, vehicleModel, status, weeklyValueMin, weeklyValueMax, startDateStartDate, startDateEndDate } = parsedQuery.data;
  const skip = (page - 1) * limit;
  const where: Prisma.ContractWhereInput = { userId: session.user.id };
  if (driverName) {
    where.driver = {
      nameNormalized: {
        contains: normalizeString(driverName),
        mode: "insensitive",
      },
    };
  }
  if (vehiclePlate || vehicleModel) {
    where.vehicle = {
      ...(vehiclePlate && { plateNormalized: { contains: normalizeString(vehiclePlate), mode: "insensitive" as const } }),
      ...(vehicleModel && { modelNormalized: { contains: normalizeString(vehicleModel), mode: "insensitive" as const } }),
    };
  }
  if (status) where.status = status;
  if (weeklyValueMin !== undefined || weeklyValueMax !== undefined) where.weeklyValue = { gte: weeklyValueMin, lte: weeklyValueMax };
  if (startDateStartDate || startDateEndDate) where.startDate = {
    gte: startDateStartDate ? new Date(startDateStartDate) : undefined,
    lte: startDateEndDate ? new Date(startDateEndDate) : undefined,
  };
  let orderBy: Prisma.ContractOrderByWithRelationInput = { createdAt: "desc" };
  if (sortColumn === "driver.name") {
    orderBy = { driver: { name: sortDirection } };
  } else if (sortColumn === "vehicle.plate") {
    orderBy = { vehicle: { plate: sortDirection } };
  } else if (sortColumn === "vehicle.model") {
    orderBy = { vehicle: { model: sortDirection } };
  } else {
    orderBy = { [sortColumn]: sortDirection };
  }
  try {
    const [contracts, total] = await prisma.$transaction([
      prisma.contract.findMany({
        where,
        include: {
          driver: {
            select: { name: true },
          },
          vehicle: {
            select: { plate: true, model: true },
          },
        },
        skip,
        take: limit,
        orderBy,
      }),
      prisma.contract.count({ where }),
    ]);
    const result = { contracts, total };
    await setRedisCache(cacheKey, result, cachedContracts);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro ao buscar contratos:", error);
    return NextResponse.json({ error: "Ocorreu um erro ao buscar contratos." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const parsed = await parseContractJson(request, contractBodySchema);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { vehicleId, driverId, ...contractData } = parsed.data;

  try {
    const [vehicle, driver] = await Promise.all([
      prisma.vehicle.findFirst({ where: { id: vehicleId, userId: session.user.id } }),
      prisma.driver.findFirst({ where: { id: driverId, userId: session.user.id } }),
    ]);
    if (!vehicle || !driver) return NextResponse.json({ error: "Veículo ou motorista não encontrado." }, { status: 400 });
    if (vehicle.status !== "Disponível") return NextResponse.json({ error: "O veículo não está disponível." }, { status: 400 });
    const startDate = new Date(contractData.startDate);
    const paymentDay = contractData.paymentDay;
    const dayOfWeekMap: { [key: string]: number } = {
      Domingo: 0,
      "Segunda-feira": 1,
      "Terça-feira": 2,
      "Quarta-feira": 3,
      "Quinta-feira": 4,
      "Sexta-feira": 5,
      Sábado: 6,
    };
    const paymentDayIndex = dayOfWeekMap[paymentDay];
    const nextPaymentDate = new Date(startDate);
    const dayDifference = (paymentDayIndex - startDate.getDay() + 7) % 7;

    if (dayDifference === 0) {
      // If the start date is the same as the payment day, add 7 days
      nextPaymentDate.setDate(startDate.getDate() + 7);
    } else {
      nextPaymentDate.setDate(startDate.getDate() + dayDifference);
    }

    const weekStart = new Date(nextPaymentDate);
    weekStart.setDate(nextPaymentDate.getDate() - 6);
    const weekEnd = new Date(nextPaymentDate);
    weekEnd.setDate(nextPaymentDate.getDate() + 6);

    const paymentsToCreate = [];
    if (contractData.duration) {
      for (let i = 0; i < contractData.duration; i++) {
        const paymentDate = new Date(nextPaymentDate);
        paymentDate.setDate(paymentDate.getDate() + i * 7);

        const weekStart = new Date(paymentDate);
        weekStart.setDate(paymentDate.getDate() - 6);
        const weekEnd = new Date(paymentDate);
        weekEnd.setDate(paymentDate.getDate() + 6);

        paymentsToCreate.push({
          value: contractData.weeklyValue,
          dueDate: paymentDate,
          weekStart,
          weekEnd,
        });
      }
    } else {
      paymentsToCreate.push({
        value: contractData.weeklyValue,
        dueDate: nextPaymentDate,
        weekStart,
        weekEnd,
      });
    }

    const newContract = await prisma.contract.create({
      data: {
        ...contractData,
        userId: session.user.id,
        vehicleId,
        driverId,
        payments: {
          create: paymentsToCreate,
        },
      },
      include: {
        driver: {
          select: { name: true },
        },
        vehicle: {
          select: { plate: true, model: true },
        },
      },
    });

    await prisma.vehicle.update({
      where: { id: vehicleId, userId: session.user.id },
      data: { status: "Alugado" },
    });
    await invalidateVehicleCaches(session.user.id);
    await invalidateContractCaches(session.user.id);

    return NextResponse.json(newContract);
  } catch (error) {
    console.error("Erro ao criar contrato:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao criar o contrato." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const parsed = await parseContractJson(request, contractIdsSchema);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { ids } = parsed.data;
  try {
    await prisma.contract.deleteMany({
      where: {
        id: {
          in: ids,
        },
        userId: session.user.id,
      },
    });
    await invalidateContractCaches(session.user.id);
    return NextResponse.json(
      { message: "Contratos excluídos com sucesso." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao excluir contratos:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao excluir os contratos." },
      { status: 500 }
    );
  }
}
