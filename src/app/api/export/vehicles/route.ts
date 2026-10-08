import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (session.user.plan === "BASIC") {
    return new NextResponse("Forbidden: Upgrade your plan to export data.", { status: 403 });
  }

  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        userId: session.user.id,
      },
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
        user: { select: { companyName: true } },
      },
    });

    if (!vehicles || vehicles.length === 0) {
      return new NextResponse("No vehicles found", { status: 404 });
    }

    const headers = [
      "ID",
      "Placa",
      "Marca",
      "Modelo",
      "Ano",
      "Cor",
      "Renavam",
      "Chassi",
      "KM",
      "Status",
      "Empresa",
    ];

    const csv = vehicles.map((vehicle) => {
      return [
        vehicle.id,
        vehicle.plate,
        vehicle.brand,
        vehicle.model,
        vehicle.year,
        vehicle.color,
        vehicle.renavam,
        vehicle.chassis,
        vehicle.km,
        vehicle.status,
        vehicle.user.companyName,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csv].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="vehicles-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting vehicles:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
