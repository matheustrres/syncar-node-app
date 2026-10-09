import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { getRedisCache, invalidateMaintenanceCaches, setRedisCache } from "@/lib/redis-cache";
import {
  maintenanceBodySchema,
  maintenanceIdsSchema,
  maintenanceListQuerySchema,
  parseMaintenanceJson,
} from "@/lib/maintenance-validation";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  for (const key of new Set(searchParams.keys())) {
    if (searchParams.getAll(key).length > 1) {
      return NextResponse.json({ error: `Parâmetro repetido: ${key}.` }, { status: 400 });
    }
  }
  const parsed = maintenanceListQuerySchema.safeParse(Object.fromEntries(searchParams.entries()));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Filtros inválidos." }, { status: 400 });
  }
  const query = parsed.data;
  const paginated = searchParams.has("page");
  const cacheKey = `syncar:cache:maintenance:${session.user.id}:api:${encodeURIComponent(JSON.stringify({ ...query, paginated }))}`;
  const cachedMaintenance = await getRedisCache<unknown>(cacheKey);
  if (cachedMaintenance.value) return NextResponse.json(cachedMaintenance.value);
  const where: Prisma.MaintenanceWhereInput = { userId: session.user.id };
  if (query.vehicleId) where.vehicleId = query.vehicleId;
  if (query.type) where.type = query.type as Prisma.MaintenanceWhereInput["type"];
  if (query.vehicle) {
    where.vehicle = { OR: [
      { plate: { contains: query.vehicle, mode: "insensitive" } },
      { model: { contains: query.vehicle, mode: "insensitive" } },
    ] };
  }
  if (query.costMin !== undefined || query.costMax !== undefined) {
    where.cost = { ...(query.costMin !== undefined && { gte: query.costMin }), ...(query.costMax !== undefined && { lte: query.costMax }) };
  }
  if (query.mileageMin !== undefined || query.mileageMax !== undefined) {
    where.mileage = { ...(query.mileageMin !== undefined && { gte: query.mileageMin }), ...(query.mileageMax !== undefined && { lte: query.mileageMax }) };
  }
  if (query.dateStartDate || query.dateEndDate) {
    where.date = {
      ...(query.dateStartDate && { gte: new Date(`${query.dateStartDate}T00:00:00.000Z`) }),
      ...(query.dateEndDate && { lte: new Date(`${query.dateEndDate}T23:59:59.999Z`) }),
    };
  }
  const { page, limit, sortColumn, sortDirection } = query;
  const orderBy: Prisma.MaintenanceOrderByWithRelationInput = sortColumn === "vehicle.plate"
    ? { vehicle: { plate: sortDirection } }
    : sortColumn === "vehicle.model"
      ? { vehicle: { model: sortDirection } }
      : { [sortColumn]: sortDirection };
  try {
    const [maintenances, total] = await prisma.$transaction([
      prisma.maintenance.findMany({
        where,
        include: { vehicle: { select: { id: true, plate: true, model: true } } },
        orderBy,
        ...(paginated && { skip: (page - 1) * limit, take: limit }),
      }),
      prisma.maintenance.count({ where }),
    ]);
    const result = paginated ? { maintenance: maintenances, total } : maintenances;
    await setRedisCache(cacheKey, result, cachedMaintenance);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching maintenances:", error);
    return NextResponse.json({ error: "Ocorreu um erro ao buscar manutenções." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const parsed = await parseMaintenanceJson(request, maintenanceBodySchema);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const data = parsed.data;
  try {
    const vehicle = await prisma.vehicle.findFirst({ where: { id: data.vehicleId, userId: session.user.id }, select: { id: true } });
    if (!vehicle) return NextResponse.json({ error: "Veículo não encontrado." }, { status: 400 });
    const normalizedDescription = data.description.trim();
    const maintenance = await prisma.$transaction(async (tx) => {
      const created = await tx.maintenance.create({
        data: {
          ...data,
          description: normalizedDescription,
          date: new Date(data.date),
          nextServiceDate: data.nextServiceDate ? new Date(data.nextServiceDate) : null,
          nextServiceMileage: data.nextServiceMileage ?? null,
          notes: data.notes || null,
          userId: session.user.id,
        },
        include: { vehicle: { select: { id: true, plate: true, model: true } } },
      });
      await tx.expense.create({
        data: {
          userId: session.user.id,
          vehicleId: created.vehicleId,
          type: created.type,
          description: normalizedDescription ? `Manutenção: ${normalizedDescription}` : "Manutenção",
          value: created.cost,
          date: created.date,
        },
      });
      return created;
    });
    await invalidateMaintenanceCaches(session.user.id);
    return NextResponse.json(maintenance, { status: 201 });
  } catch (error) {
    console.error("Error creating maintenance record:", error);
    return NextResponse.json({ error: "Ocorreu um erro ao criar a manutenção." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  const parsed = await parseMaintenanceJson(request, maintenanceIdsSchema);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    await prisma.maintenance.deleteMany({ where: { id: { in: parsed.data.ids }, userId: session.user.id } });
    await invalidateMaintenanceCaches(session.user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting maintenance records:", error);
    return NextResponse.json({ error: "Ocorreu um erro ao excluir as manutenções." }, { status: 500 });
  }
}
