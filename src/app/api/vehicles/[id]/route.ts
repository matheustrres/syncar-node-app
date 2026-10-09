import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

import { normalizeString } from "@/lib/string-utils";
import { parseJsonBody, vehicleIdSchema, vehicleUpdateSchema } from "@/lib/vehicle-validation";

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await context.params;
  const parsedId = vehicleIdSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "ID de veículo inválido." }, { status: 400 });
  }
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: parsedId.data, userId: session.user.id },
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
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await context.params;
  const parsedId = vehicleIdSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "ID de veículo inválido." }, { status: 400 });
  }
  const parsedBody = await parseJsonBody(request, vehicleUpdateSchema);
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error }, { status: 400 });
  }
  const data = parsedBody.data;
  const updateData = {
    ...data,
    ...(data.plate !== undefined ? { plateNormalized: normalizeString(data.plate) } : {}),
    ...(data.model !== undefined ? { modelNormalized: normalizeString(data.model) } : {}),
  };
  const updatedVehicle = await prisma.vehicle.update({
    where: { id: parsedId.data, userId: session.user.id },
    data: updateData,
  });
  return NextResponse.json(updatedVehicle);
}

export async function DELETE(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await context.params;
  const parsedId = vehicleIdSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "ID de veículo inválido." }, { status: 400 });
  }
  await prisma.vehicle.delete({
    where: { id: parsedId.data, userId: session.user.id },
  });
  return NextResponse.json({ message: "Veículo deletado" }, { status: 200 });
}
