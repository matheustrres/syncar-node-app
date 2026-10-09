import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email"; // We will create this later
import { forgotPasswordSchema, parseAuthJson } from "@/lib/auth-validation";

export async function POST(request: Request) {
  try {
    const parsed = await parseAuthJson(request, forgotPasswordSchema);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    const { email } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json(
        {
          message:
            "Se o email estiver cadastrado, você receberá um link de recuperação.",
        },
        { status: 200 }
      );
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1800000);
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expires,
      },
    });
    await sendPasswordResetEmail(user.email, token);
    return NextResponse.json(
      {
        message:
          "Se o email estiver cadastrado, você receberá um link de recuperação.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao solicitar recuperação de senha:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro interno ao solicitar a recuperação de senha." },
      { status: 500 }
    );
  }
}
