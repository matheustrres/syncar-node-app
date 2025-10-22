import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function PUT(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Não autorizado", { status: 401 });
  }
  const { id } = await params;
  if (!id) {
    return new NextResponse("ID da notificação não encontrado", {
      status: 400,
    });
  }
  try {
    const updatedNotification = await prisma.notification.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        isRead: true,
      },
    });
    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error(`Erro ao marcar notificação ${id} como lida:`, error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
