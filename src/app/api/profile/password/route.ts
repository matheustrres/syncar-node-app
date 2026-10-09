import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { parseProfileJson, profilePasswordSchema } from "@/lib/profile-validation";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const parsed = await parseProfileJson(request, profilePasswordSchema);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    const { currentPassword, newPassword } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "A senha atual está incorreta." },
        { status: 400 }
      );
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedNewPassword },
      select: { id: true },
    });
    return NextResponse.json({ message: "Senha alterada com sucesso." });
  } catch {
    return NextResponse.json(
      { error: "Erro ao alterar a senha." },
      { status: 500 }
    );
  }
}
