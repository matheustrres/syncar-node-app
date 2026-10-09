import { z } from "zod";
import { strongPasswordSchema } from "./auth-validation.ts";

const profileText = (label: string) => z.string().trim().min(1, `${label} é obrigatório.`).max(120, `${label} deve ter no máximo 120 caracteres.`);

export const profileUpdateSchema = z.object({
  name: profileText("Nome"),
  email: z.string().trim().pipe(z.email("E-mail inválido.").max(254)).transform((value) => value.toLowerCase()),
  companyName: profileText("Nome da empresa"),
}).strict();

export const profilePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Informe a senha atual.").max(256),
  newPassword: strongPasswordSchema,
}).strict();

export async function parseProfileJson<T extends z.ZodType>(request: Request, schema: T) {
  let body: unknown;
  try { body = await request.json(); } catch { return { success: false as const, error: "JSON inválido." }; }
  const result = schema.safeParse(body);
  if (!result.success) return { success: false as const, error: result.error.issues[0]?.message ?? "Dados inválidos." };
  return { success: true as const, data: result.data as z.output<T> };
}
