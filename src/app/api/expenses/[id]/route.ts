import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

async function getExpense(id: string, userId: string) {
  return await prisma.expense.findFirst({
    where: { id, userId },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const expense = await getExpense(params.id, session.user.id);
  if (!expense) {
    return NextResponse.json(
      { error: "Despesa não encontrada" },
      { status: 404 }
    );
  }
  const data = await request.json();
  const updatedExpense = await prisma.expense.update({
    where: { id: params.id },
    data,
  });
  return NextResponse.json(updatedExpense);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const expense = await getExpense(params.id, session.user.id);
  if (!expense) {
    return NextResponse.json(
      { error: "Despesa não encontrada" },
      { status: 404 }
    );
  }
  await prisma.expense.delete({ where: { id: params.id } });
  return NextResponse.json({ message: "Despesa excluída com sucesso" });
}
