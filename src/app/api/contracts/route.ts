import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const contracts = await prisma.contract.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(contracts);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const data = await request.json();
  const { vehicleId, status, startDate, weeklyValue, paymentDay } = data;

  if (status === "Ativo") {
    try {
      const dayMap: { [key: string]: number } = {
        Domingo: 0,
        "Segunda-feira": 1,
        "Terça-feira": 2,
        "Quarta-feira": 3,
        "Quinta-feira": 4,
        "Sexta-feira": 5,
        Sábado: 6,
      };
      const paymentDayNumber = dayMap[paymentDay];

      const newContract = await prisma.$transaction(async (prisma) => {
        const createdContract = await prisma.contract.create({
          data: { ...data, userId: session.user.id },
        });
        await prisma.vehicle.update({
          where: { id: vehicleId },
          data: { status: "Alugado" },
        });
        const currentWeekStart = new Date(startDate);
        const paymentsToCreate = [];
        for (let i = 0; i < 4; i++) {
          const weekStart = new Date(currentWeekStart);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          const dueDate = new Date(weekStart);
          const dayDifference = (paymentDayNumber - dueDate.getDay() + 7) % 7;
          dueDate.setDate(dueDate.getDate() + dayDifference);
          if (dueDate < weekStart) {
            dueDate.setDate(dueDate.getDate() + 7);
          }
          paymentsToCreate.push({
            contractId: createdContract.id,
            weekStart: weekStart,
            weekEnd: weekEnd,
            value: weeklyValue,
            dueDate: dueDate,
            status: "Pendente",
          });
          currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        }
        await prisma.payment.createMany({
          data: paymentsToCreate,
        });

        return createdContract;
      });
      return NextResponse.json(newContract, { status: 201 });
    } catch (error) {
      console.error("Erro na transação de criação de contrato:", error);
      return NextResponse.json(
        { error: "Falha ao criar contrato e gerar pagamentos." },
        { status: 500 }
      );
    }
  } else {
    const newContract = await prisma.contract.create({
      data: { ...data, userId: session.user.id },
    });
    return NextResponse.json(newContract, { status: 201 });
  }
}
