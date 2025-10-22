import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

interface IParams {
  id?: string;
}

export async function PUT(req: Request, { params }: { params: IParams }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  const { id } = params;

  if (!id) {
    return new NextResponse("ID da notificação não encontrado", { status: 400 });
  }

  try {
    const updatedNotification = await prisma.notification.update({
      where: {
        id,
        userId: session.user.id, // Garante que o usuário só pode atualizar suas próprias notificações
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
