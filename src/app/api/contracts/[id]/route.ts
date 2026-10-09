import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { contractBodySchema, contractIdSchema, parseContractJson } from "@/lib/contract-validation";

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!contractIdSchema.safeParse(id).success) return NextResponse.json({ error: "ID de contrato inválido." }, { status: 400 });
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
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await context.params;
  if (!contractIdSchema.safeParse(id).success) return NextResponse.json({ error: "ID de contrato inválido." }, { status: 400 });
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
  const parsed = await parseContractJson(request, contractBodySchema);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const data = parsed.data;
  const [vehicle, driver] = await Promise.all([
    prisma.vehicle.findFirst({ where: { id: data.vehicleId, userId: session.user.id } }),
    prisma.driver.findFirst({ where: { id: data.driverId, userId: session.user.id } }),
  ]);
  if (!vehicle || !driver) return NextResponse.json({ error: "Veículo ou motorista não encontrado." }, { status: 400 });
  const updatedContract = await prisma.contract.update({
    where: { id, userId: session.user.id },
    data,
    include: {
      driver: { select: { name: true } },
      vehicle: { select: { plate: true, model: true } },
    },
  });
  if (
    data.weeklyValue &&
    data.weeklyValue !== contractBeforeUpdate.weeklyValue
  ) {
    await prisma.payment.updateMany({
      where: {
        contractId: id,
        status: "Pendente",
        dueDate: { gte: new Date() },
      },
      data: {
        value: data.weeklyValue,
      },
    });
  }
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
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await context.params;
  if (!contractIdSchema.safeParse(id).success) return NextResponse.json({ error: "ID de contrato inválido." }, { status: 400 });
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
