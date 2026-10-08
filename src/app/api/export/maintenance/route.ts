import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

function csvCell(value: string | number | null | undefined) {
  if (value == null) return "";
  const text = typeof value === "string" && /^[\s]*[=+\-@]/.test(value)
    ? `'${value}`
    : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (session.user.plan !== "PROFESSIONAL") {
    return new NextResponse("Forbidden: Upgrade your plan to export data.", { status: 403 });
  }

  try {
    const maintenance = await prisma.maintenance.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      select: {
        id: true,
        type: true,
        description: true,
        cost: true,
        date: true,
        mileage: true,
        nextServiceMileage: true,
        nextServiceDate: true,
        notes: true,
        vehicle: { select: { plate: true, model: true } },
      },
    });

    if (maintenance.length === 0) {
      return new NextResponse("No maintenances found", { status: 404 });
    }

    const headers = [
      "ID", "Placa", "Modelo", "Tipo", "Descrição", "Custo", "Data",
      "Quilometragem", "Próxima quilometragem", "Próxima data", "Observações",
    ];
    const rows = maintenance.map((item) => [
      item.id,
      item.vehicle.plate,
      item.vehicle.model,
      item.type,
      item.description,
      item.cost,
      item.date.toISOString().slice(0, 10),
      item.mileage,
      item.nextServiceMileage,
      item.nextServiceDate?.toISOString().slice(0, 10),
      item.notes,
    ].map(csvCell).join(","));
    const csv = `\uFEFF${headers.map(csvCell).join(",")}\r\n${rows.join("\r\n")}`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="maintenance-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting maintenance:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
