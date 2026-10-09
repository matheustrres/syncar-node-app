import { MillionSend } from "millionsend";

const resetPasswordEmailHtml = (resetLink: string) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0; padding:32px 16px; background-color:#f7f6ef; font-family:Inter, Arial, sans-serif; color:#142c2e;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%; max-width:600px; background-color:#ffffff; border:1px solid #dce4dc; border-radius:14px; overflow:hidden;">
          <tr>
            <td style="padding:26px 36px; background-color:#102d30;">
              <span style="font-size:24px; line-height:1; font-weight:750; letter-spacing:-1px; color:#ffffff;">syncar<span style="color:#d8f779;">.</span></span>
            </td>
          </tr>
          <tr>
            <td style="padding:36px;">
              <h1 style="margin:0 0 22px; color:#142c2e; font-size:26px; line-height:1.25; letter-spacing:-0.5px; font-weight:700;">Recuperação de senha</h1>
              <p style="margin:0 0 16px; color:#52655f; font-size:15px; line-height:1.7;">Olá,</p>
              <p style="margin:0 0 16px; color:#52655f; font-size:15px; line-height:1.7;">Recebemos uma solicitação para redefinir a senha da sua conta SynCar.</p>
              <p style="margin:0 0 26px; color:#52655f; font-size:15px; line-height:1.7;">Para prosseguir com a redefinição, clique no botão abaixo:</p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 26px;">
                <tr>
                  <td align="center" bgcolor="#d8f779" style="border-radius:8px;">
                    <a href="${resetLink}" style="display:inline-block; padding:15px 24px; border:1px solid #d8f779; border-radius:8px; color:#102d30; text-decoration:none; font-size:14px; line-height:1.2; font-weight:700;">Redefinir senha</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 14px; color:#52655f; font-size:13px; line-height:1.65;">Este link de redefinição de senha é válido por 1 hora.</p>
              <p style="margin:0; color:#52655f; font-size:13px; line-height:1.65;">Se você não solicitou esta alteração, ignore este e-mail. Sua senha atual permanecerá a mesma.</p>
              <p style="margin:26px 0 0; color:#142c2e; font-size:14px; line-height:1.6;">Atenciosamente,<br />A equipe SynCar</p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 36px; border-top:1px solid #dce4dc; background-color:#eef3ec; color:#52655f; font-size:12px; line-height:1.5;">
              &copy; ${new Date().getFullYear()} SynCar. Todos os direitos reservados.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
`;

export async function sendPasswordResetEmail(email: string, token: string) {
  const apiKey = process.env.MILLIONSEND_API_KEY;
  const from = process.env.MILLIONSEND_FROM;
  const appUrl = process.env.NEXTAUTH_URL;

  if (!apiKey) {
    throw new Error("MILLIONSEND_API_KEY não está configurada.");
  }
  if (!from) {
    throw new Error("MILLIONSEND_FROM não está configurada.");
  }
  if (!appUrl) {
    throw new Error("NEXTAUTH_URL não está configurada.");
  }

  const client = new MillionSend(apiKey);
  const resetLink = new URL(
    `/reset-password/${encodeURIComponent(token)}`,
    appUrl
  ).toString();
  const { error } = await client.emails.send({
    from,
    to: email,
    subject: "Recuperação de Senha - Syncar",
    html: resetPasswordEmailHtml(resetLink),
  });

  if (error) {
    throw new Error(`MillionSend: ${error.name}: ${error.message}`);
  }
}
