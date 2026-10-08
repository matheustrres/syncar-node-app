import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse("Não autorizado", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const isRead = searchParams.get("isRead");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const summary = searchParams.get("summary") === "true";
  const skip = (page - 1) * limit;

  const where: { userId: string; isRead?: boolean } = {
    userId: session.user.id,
  };

  if (isRead !== null) {
    where.isRead = isRead === "true";
  }

  try {
    const notificationsQuery = prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        type: true,
        message: true,
        relatedEntityId: true,
        isRead: true,
        createdAt: true,
      },
    });
    const unreadCountQuery = prisma.notification.count({
      where: { userId: session.user.id, isRead: false },
    });

    if (summary) {
      const [notifications, unreadCount] = await prisma.$transaction([
        notificationsQuery,
        unreadCountQuery,
      ]);
      return NextResponse.json({ notifications, unreadCount });
    }

    const [notifications, total, unreadCount] = await prisma.$transaction([
      notificationsQuery,
      prisma.notification.count({ where }),
      unreadCountQuery,
    ]);

    return NextResponse.json({ notifications, total, unreadCount });
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    return new NextResponse("Erro interno do servidor", { status: 500 });
  }
}
