import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

import { prisma } from "@/lib/prisma";
import { maintenanceBodySchema, maintenanceIdSchema, parseMaintenanceJson } from "@/lib/maintenance-validation";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = await params;
  if (!maintenanceIdSchema.safeParse(id).success) return NextResponse.json({ error: "ID de manutenção inválido." }, { status: 400 });
  try {
    const maintenance = await prisma.maintenance.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        vehicle: true,
      },
    });
    if (!maintenance) {
      return new NextResponse("Maintenance record not found", { status: 404 });
    }
    return NextResponse.json(maintenance);
  } catch (error) {
    console.error(`Error fetching maintenance record ${id}:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = await params;
  if (!maintenanceIdSchema.safeParse(id).success) return NextResponse.json({ error: "ID de manutenção inválido." }, { status: 400 });
  try {
    const parsed = await parseMaintenanceJson(request, maintenanceBodySchema);
    if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const data = parsed.data;
    const vehicle = await prisma.vehicle.findFirst({ where: { id: data.vehicleId, userId: session.user.id }, select: { id: true } });
    if (!vehicle) return NextResponse.json({ error: "Veículo não encontrado." }, { status: 400 });
    const normalizedDescription = data.description.trim();
    const updatedMaintenance = await prisma.maintenance.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        vehicleId: data.vehicleId,
        type: data.type,
        description: normalizedDescription,
        cost: data.cost,
        date: new Date(data.date),
        mileage: data.mileage,
        nextServiceMileage: data.nextServiceMileage ?? null,
        nextServiceDate: data.nextServiceDate ? new Date(data.nextServiceDate) : null,
        notes: data.notes || null,
      },
    });
    return NextResponse.json(updatedMaintenance);
  } catch (error) {
    console.error(`Error updating maintenance record ${id}:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = await params;
  if (!maintenanceIdSchema.safeParse(id).success) return NextResponse.json({ error: "ID de manutenção inválido." }, { status: 400 });
  try {
    await prisma.maintenance.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting maintenance record ${id}:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
