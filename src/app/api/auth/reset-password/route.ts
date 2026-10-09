import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { parseAuthJson, resetPasswordSchema } from "@/lib/auth-validation";
import { consumeRateLimits, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const parsed = await parseAuthJson(request, resetPasswordSchema);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { token, password } = parsed.data;
    const rateLimit = await consumeRateLimits([
      { scope: "resetIp", value: getClientIp(request.headers) },
      { scope: "resetToken", value: token },
    ]);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente mais tarde." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!resetToken || resetToken.expires < new Date()) {
      return NextResponse.json(
        { error: "Token inválido ou expirado." },
        { status: 400 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.$transaction(async (prisma) => {
      await prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      });

      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
    });
    return NextResponse.json(
      { message: "Senha redefinida com sucesso!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao redefinir a senha." },
      { status: 500 }
    );
  }
}
