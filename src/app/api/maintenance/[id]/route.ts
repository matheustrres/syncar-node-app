import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = await params;
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
    const updatedMaintenance = await prisma.maintenance.update({
      where: {
        id,
        userId: session.user.id,
      },
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
