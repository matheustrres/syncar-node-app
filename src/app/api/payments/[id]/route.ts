import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const data = await request.json();
  const updatedPayment = await prisma.payment.update({ where: { id }, data });
  return NextResponse.json(updatedPayment);
}

export async function DELETE(
  _: NextRequest,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  await prisma.payment.delete({ where: { id } });
  return NextResponse.json({ message: "Pagamento deletado" }, { status: 200 });
}
