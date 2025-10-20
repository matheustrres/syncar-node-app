import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

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
  if (vehiclePlate) {
    where.vehicle = {
      ...where.vehicle!,
      plateNormalized: {
        contains: normalizeString(vehiclePlate),
        mode: "insensitive",
      },
    };
  }
  const vehicleModel = searchParams.get("vehicleModel");
  if (vehicleModel) {
    where.vehicle = {
      ...where.vehicle!,
      modelNormalized: {
        contains: normalizeString(vehicleModel),
        mode: "insensitive",
      },
    };
  }
  // Parse other filters
  searchParams.forEach((value, key) => {
    if (
      [
        "page",
        "limit",
        "sortColumn",
        "sortDirection",
        "driverName",
        "vehiclePlate",
        "vehicleModel",
      ].includes(key)
    ) {
      return;
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
        where[field] = { ...where[field]!, gte: parseFloat(value) };
      }
    }
    if (key.endsWith("Max")) {
      const field = key.replace("Max", "");
      if (value) {
        where[field] = { ...where[field]!, lte: parseFloat(value) };
      }
    }
    // Date range filters
    if (key.endsWith("StartDate")) {
      const field = key.replace("StartDate", "");
      if (value) {
        where[field] = { ...where[field]!, gte: new Date(value) };
      }
    }
    if (key.endsWith("EndDate")) {
      const field = key.replace("EndDate", "");
      if (value) {
        where[field] = { ...where[field]!, lte: new Date(value) };
      }
    }
  });
  let orderBy:
    | { [key: string]: "asc" | "desc" }
    | { driver: { name: "asc" | "desc" } }
    | { vehicle: { plate: "asc" | "desc" } }
    | { vehicle: { model: "asc" | "desc" } } = {
    createdAt: "desc",
  };
  if (sortColumn === "driver.name") {
    orderBy = { driver: { name: sortDirection as "asc" | "desc" } };
  } else if (sortColumn === "vehicle.plate") {
    orderBy = { vehicle: { plate: sortDirection as "asc" | "desc" } };
  } else if (sortColumn === "vehicle.model") {
    orderBy = { vehicle: { model: sortDirection as "asc" | "desc" } };
  } else {
    orderBy = { [sortColumn]: sortDirection as "asc" | "desc" };
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
    let nextPaymentDate = new Date(startDate);
    nextPaymentDate.setDate(
      startDate.getDate() + ((paymentDayIndex - startDate.getDay() + 7) % 7)
    );

    const weekStart = new Date(nextPaymentDate);
    weekStart.setDate(nextPaymentDate.getDate() - 6);
    const weekEnd = new Date(nextPaymentDate);

    const newContract = await prisma.contract.create({
      data: {
        ...contractData,
        userId: session.user.id,
        vehicleId,
        payments: {
          create: {
            value: contractData.weeklyValue,
            dueDate: nextPaymentDate,
            weekStart,
            weekEnd,
          },
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
