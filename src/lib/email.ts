import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: process.env.EMAIL_SERVER_SECURE === "true",
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Recuperação de Senha - Syncar",
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #4b5563; background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
          <div style="background-color: #2563eb; padding: 20px; text-align: center; color: #ffffff;">
            <h1 style="font-size: 28px; font-weight: bold; margin: 0;">Syncar</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; margin-bottom: 15px;">Prezado(a) usuário(a),</p>
            <p style="font-size: 16px; margin-bottom: 15px;">Recebemos uma solicitação para redefinir a senha da sua conta Syncar.</p>
            <p style="font-size: 16px; margin-bottom: 25px;">Para prosseguir com a redefinição, por favor, clique no botão abaixo:</p>
            <p style="text-align: center; margin-bottom: 25px;">
              <a href="${resetLink}" style="display: inline-block; padding: 12px 25px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Redefinir Senha
              </a>
            </p>
            <p style="font-size: 14px; color: #6b7280; margin-bottom: 15px;">Este link de redefinição de senha é válido por 1 hora.</p>
            <p style="font-size: 14px; color: #6b7280;">Se você não solicitou esta alteração, por favor, ignore este email. Sua senha atual permanecerá a mesma.</p>
            <p style="font-size: 16px; margin-top: 25px; margin-bottom: 0;">Atenciosamente,</p>
            <p style="font-size: 16px; margin-top: 5px; margin-bottom: 0;">A equipe Syncar</p>
          </div>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb;">
            <p>&copy; ${new Date().getFullYear()} Syncar. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    `,
  });
}
