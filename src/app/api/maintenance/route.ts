import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get("vehicleId");
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 10));
    const vehicle = searchParams.get("vehicle")?.trim();
    const type = searchParams.get("type");
    const allowedTypes = ["PREVENTIVA", "CORRETIVA", "TROCA_OLEO", "PNEUS", "FREIOS", "OUTROS"] as const;
    const where: Prisma.MaintenanceWhereInput = {
      userId: session.user.id,
      ...(vehicleId && { vehicleId }),
      ...(type && allowedTypes.some((value) => value === type) && { type: type as Prisma.EnumMaintenanceTypeFilter["equals"] }),
      ...(vehicle && { vehicle: { OR: [
        { plate: { contains: vehicle, mode: "insensitive" } },
        { model: { contains: vehicle, mode: "insensitive" } },
      ] } }),
    };
    const numberFilter = (minKey: string, maxKey: string): { gte?: number; lte?: number } => {
      const min = Number(searchParams.get(minKey));
      const max = Number(searchParams.get(maxKey));
      return {
        ...(searchParams.has(minKey) && Number.isFinite(min) && { gte: min }),
        ...(searchParams.has(maxKey) && Number.isFinite(max) && { lte: max }),
      };
    };
    const cost = numberFilter("costMin", "costMax");
    const mileage = numberFilter("mileageMin", "mileageMax");
    if (Object.keys(cost).length) where.cost = cost;
    if (Object.keys(mileage).length) where.mileage = mileage;
    const startDate = searchParams.get("dateStartDate");
    const endDate = searchParams.get("dateEndDate");
    if (startDate || endDate) {
      where.date = {
        ...(startDate && !Number.isNaN(Date.parse(startDate)) && { gte: new Date(`${startDate}T00:00:00.000Z`) }),
        ...(endDate && !Number.isNaN(Date.parse(endDate)) && { lte: new Date(`${endDate}T23:59:59.999Z`) }),
      };
    }
    const sortColumn = searchParams.get("sortColumn") || "date";
    const sortDirection = searchParams.get("sortDirection") === "asc" ? "asc" : "desc";
    const sortable = ["date", "type", "description", "cost", "mileage"];
    const orderBy: Prisma.MaintenanceOrderByWithRelationInput = sortColumn === "vehicle.plate"
      ? { vehicle: { plate: sortDirection } }
      : sortColumn === "vehicle.model"
        ? { vehicle: { model: sortDirection } }
        : { [sortable.includes(sortColumn) ? sortColumn : "date"]: sortDirection };
    const paginated = searchParams.has("page");
    const [maintenances, total] = await prisma.$transaction([
      prisma.maintenance.findMany({
        where,
        include: { vehicle: { select: { id: true, plate: true, model: true } } },
        orderBy,
        ...(paginated && { skip: (page - 1) * limit, take: limit }),
      }),
      prisma.maintenance.count({ where }),
    ]);
    return NextResponse.json(paginated ? { maintenance: maintenances, total } : maintenances);
  } catch (error) {
    console.error("Error fetching maintenances:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    const body = await request.json();
    const {
      vehicleId,
      type,
      description,
      cost,
      date,
      mileage,
      nextServiceMileage,
      nextServiceDate,
      notes,
    } = body;
    if (!vehicleId || !type || !description || !cost || !date || !mileage) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const newMaintenance = await prisma.$transaction(async (tx) => {
      const maintenance = await tx.maintenance.create({
        data: {
          vehicleId,
          type,
          description,
          cost: parseFloat(cost),
          date: new Date(date),
          mileage: parseInt(mileage),
          nextServiceMileage: nextServiceMileage
            ? parseInt(nextServiceMileage)
            : null,
          nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null,
          notes,
          userId: session.user.id,
        },
        include: {
          vehicle: { select: { id: true, plate: true, model: true } },
        },
      });

      await tx.expense.create({
        data: {
          userId: session.user.id,
          vehicleId: maintenance.vehicleId,
          type: maintenance.type,
          description: `Manutenção: ${maintenance.description}`,
          value: maintenance.cost,
          date: maintenance.date,
        },
      });

      return maintenance;
    });

    return NextResponse.json(newMaintenance, { status: 201 });
  } catch (error) {
    console.error("Error creating maintenance record:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new NextResponse("Invalid request body", { status: 400 });
    }

    await prisma.maintenance.deleteMany({
      where: {
        id: {
          in: ids,
        },
        userId: session.user.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting maintenance records:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
