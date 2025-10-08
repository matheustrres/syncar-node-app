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
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: id, userId: session.user.id },
  });
  if (!vehicle) {
    return NextResponse.json(
      { error: "Veículo não encontrado" },
      { status: 404 }
    );
  }
  return NextResponse.json(vehicle);
}

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
  const updatedVehicle = await prisma.vehicle.update({
    where: { id: id, userId: session.user.id },
    data,
  });
  return NextResponse.json(updatedVehicle);
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
  await prisma.vehicle.delete({
    where: { id: id, userId: session.user.id },
  });
  return NextResponse.json({ message: "Veículo deletado" }, { status: 200 });
}
