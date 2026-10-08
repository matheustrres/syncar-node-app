import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

import { normalizeString } from "@/lib/string-utils";
import { Prisma } from "@prisma/client";

const sortableColumns = new Set([
  "createdAt", "startDate", "weeklyValue", "duration", "status", "driver.name", "vehicle.plate", "vehicle.model",
]);

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const requestedPage = Number(searchParams.get("page"));
  const requestedLimit = Number(searchParams.get("limit"));
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 && requestedPage <= 100000 ? requestedPage : 1;
  const limit = Number.isSafeInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 100) : 10;
  const requestedSort = searchParams.get("sortColumn") || "createdAt";
  const sortColumn = sortableColumns.has(requestedSort) ? requestedSort : "createdAt";
  const sortDirection = searchParams.get("sortDirection") === "asc" ? "asc" : "desc";
  const skip = (page - 1) * limit;
  const where: Prisma.ContractWhereInput = { userId: session.user.id };
  const driverName = searchParams.get("driverName");
  if (driverName) {
    where.driver = {
      nameNormalized: {
        contains: normalizeString(driverName),
        mode: "insensitive",
      },
    };
  }
  const vehiclePlate = searchParams.get("vehiclePlate");
  const vehicleModel = searchParams.get("vehicleModel");
  if (vehiclePlate || vehicleModel) {
    where.vehicle = {
      ...(vehiclePlate && { plateNormalized: { contains: normalizeString(vehiclePlate), mode: "insensitive" as const } }),
      ...(vehicleModel && { modelNormalized: { contains: normalizeString(vehicleModel), mode: "insensitive" as const } }),
    };
  }
  const status = searchParams.get("status");
  if (status === "Ativo" || status === "Encerrado") where.status = status;
  const weeklyValueMin = Number(searchParams.get("weeklyValueMin"));
  const weeklyValueMax = Number(searchParams.get("weeklyValueMax"));
  if (searchParams.get("weeklyValueMin") && Number.isFinite(weeklyValueMin)) where.weeklyValue = { gte: weeklyValueMin };
  if (searchParams.get("weeklyValueMax") && Number.isFinite(weeklyValueMax)) {
    where.weeklyValue = { ...where.weeklyValue as Prisma.FloatFilter, lte: weeklyValueMax };
  }
  const startDate = searchParams.get("startDateStartDate");
  const endDate = searchParams.get("startDateEndDate");
  if (startDate && !Number.isNaN(Date.parse(startDate))) where.startDate = { gte: new Date(startDate) };
  if (endDate && !Number.isNaN(Date.parse(endDate))) {
    where.startDate = { ...where.startDate as Prisma.DateTimeFilter, lte: new Date(endDate) };
  }
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
  return NextResponse.json({ contracts, total });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { vehicleId, ...contractData } = body;

  try {
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
      where: { id: vehicleId },
      data: { status: "Alugado" },
    });

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
  const { ids } = await request.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { error: "IDs inválidos fornecidos." },
      { status: 400 }
    );
  }
  try {
    await prisma.contract.deleteMany({
      where: {
        id: {
          in: ids,
        },
        userId: session.user.id,
      },
    });
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
