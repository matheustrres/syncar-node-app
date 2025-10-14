import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const driverId = params.id;
  const driver = await prisma.driver.findFirst({
    where: {
      id: driverId,
      userId: session.user.id,
    },
  });
  if (!driver) {
    return NextResponse.json(
      { error: "Motorista não encontrado ou não pertence ao usuário" },
      { status: 404 }
    );
  }
  const payments = await prisma.payment.findMany({
    where: {
      contract: {
        driverId: driverId,
      },
    },
    include: {
      contract: {
        select: {
          vehicle: {
            select: {
              plate: true,
              model: true,
            },
          },
        },
      },
    },
    orderBy: {
      dueDate: "desc",
    },
  });
  return NextResponse.json(payments);
}
