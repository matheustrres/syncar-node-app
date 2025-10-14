import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(
  _: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const vehicleId = params.id;
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: vehicleId,
      userId: session.user.id,
    },
  });
  if (!vehicle) {
    return NextResponse.json(
      { error: "Veículo não encontrado ou não pertence ao usuário" },
      { status: 404 }
    );
  }
  const expenses = await prisma.expense.findMany({
    where: {
      vehicleId: vehicleId,
    },
    orderBy: {
      date: "desc",
    },
  });
  return NextResponse.json(expenses);
}
