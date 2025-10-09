import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(_: NextRequest, context: { params: { id: string } }) {
  const { id } = context.params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const contract = await prisma.contract.findUnique({
    where: { id, userId: session.user.id },
    include: {
      driver: true,
      vehicle: true,
    },
  });
  if (!contract) {
    return NextResponse.json(
      { error: "Contrato não encontrado" },
      { status: 404 }
    );
  }
  return NextResponse.json(contract);
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = context.params;
  const contractBeforeUpdate = await prisma.contract.findUnique({
    where: { id },
  });
  if (
    !contractBeforeUpdate ||
    contractBeforeUpdate.userId !== session.user.id
  ) {
    return NextResponse.json(
      { error: "Contrato não encontrado" },
      { status: 404 }
    );
  }
  const data = await request.json();
  const updatedContract = await prisma.contract.update({ where: { id }, data });
  if (
    contractBeforeUpdate.status === "Ativo" &&
    updatedContract.status === "Encerrado"
  ) {
    await prisma.vehicle.update({
      where: { id: contractBeforeUpdate.vehicleId },
      data: { status: "Disponível" },
    });
  }
  return NextResponse.json(updatedContract);
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = context.params;
  const contractToDelete = await prisma.contract.findUnique({ where: { id } });
  if (!contractToDelete || contractToDelete.userId !== session.user.id) {
    return NextResponse.json(
      { error: "Contrato não encontrado" },
      { status: 404 }
    );
  }
  if (contractToDelete.status === "Ativo") {
    await prisma.$transaction([
      prisma.vehicle.update({
        where: { id: contractToDelete.vehicleId },
        data: { status: "Disponível" },
      }),
      prisma.contract.delete({ where: { id } }),
    ]);
  } else {
    await prisma.contract.delete({ where: { id } });
  }
  return NextResponse.json({ message: "Contrato deletado" }, { status: 200 });
}
