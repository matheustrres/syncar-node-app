import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get("vehicleId");
    const maintenances = await prisma.maintenance.findMany({
      where: {
        userId: session.user.id,
        ...(vehicleId && { vehicleId }),
      },
      include: {
        vehicle: true,
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(maintenances);
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
          vehicle: true,
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