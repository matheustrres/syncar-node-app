import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email"; // We will create this later

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json(
        { error: "Email é obrigatório." },
        { status: 400 }
      );
    }
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
