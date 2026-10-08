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
    const contracts = await prisma.contract.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        weeklyValue: true,
        paymentDay: true,
        startDate: true,
        deposit: true,
        status: true,
        duration: true,
        driver: { select: { name: true, cpf: true } },
        vehicle: { select: { plate: true, model: true } },
      },
    });
    if (!contracts || !contracts.length) {
      return new NextResponse("No contracts found", { status: 404 });
    }
    const headers = [
      "ID",
      "Valor semanal",
      "Dia de pagamento",
      "Data de início",
      "Depósito",
      "Status",
      "Duração (semanas)",
      "Nome do motorista",
      "CPF do Motorista",
      "Placa do veículo",
      "Modelo do veículo",
      "Empresa",
    ];
    const csv = contracts.map((contract) => {
      return [
        contract.id,
        contract.weeklyValue,
        contract.paymentDay,
        contract.startDate.toISOString().split("T")[0],
        contract.deposit,
        contract.status,
        contract.duration || "N/A",
        contract.driver.name,
        contract.driver.cpf,
        contract.vehicle.plate,
        contract.vehicle.model,
        session.user.companyName,
      ].join(",");
    });
    const csvContent = [headers.join(","), ...csv].join("\n");
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="contracts-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting contracts:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
