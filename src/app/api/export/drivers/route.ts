import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  if (session.user.plan === "BASIC") {
    return new NextResponse("Forbidden: Upgrade your plan to export data.", { status: 403 });
  }

  try {
    const drivers = await prisma.driver.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        user: true,
      },
    });

    if (!drivers || drivers.length === 0) {
      return new NextResponse("No drivers found", { status: 404 });
    }

    const headers = [
      "ID",
      "Nome",
      "CPF",
      "Telefone",
      "Email",
      "CNH",
      "Validade CNH",
      "CEP",
      "Logradouro",
      "Número",
      "Complemento",
      "Bairro",
      "Cidade",
      "UF",
      "Status",
      "Empresa",
    ];

    const csv = drivers.map((driver) => {
      return [
        driver.id,
        driver.name,
        driver.cpf,
        driver.phone,
        driver.email,
        driver.cnh,
        driver.cnhValidity.toISOString().split("T")[0],
        driver.cep || "N/A",
        driver.logradouro || "N/A",
        driver.numero || "N/A",
        driver.complemento || "N/A",
        driver.bairro || "N/A",
        driver.cidade || "N/A",
        driver.uf || "N/A",
        driver.status,
        driver.user.companyName,
      ].join(",");
    });

    const csvContent = [headers.join(","), ...csv].join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="drivers-${Date.now()}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting drivers:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
