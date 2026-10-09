import { z } from "zod";

export const strongPasswordSchema = z.string()
  .min(9, "A senha deve ter no mínimo 9 caracteres.")
  .regex(/[a-z]/, "A senha deve conter uma letra minúscula.")
  .regex(/[A-Z]/, "A senha deve conter uma letra maiúscula.")
  .regex(/\d/, "A senha deve conter um número.")
  .refine(
    (value) => (value.match(/[!@#$%^&*(),.?":{}|<>]/g) ?? []).length >= 2,
    "A senha deve conter pelo menos dois caracteres especiais."
  )
  .refine((value) => new TextEncoder().encode(value).length <= 72, "A senha deve ter no máximo 72 bytes.");

export const bcryptHashSchema = z.string()
  .regex(/^\$2[abyx]\$(\d{2})\$[./A-Za-z0-9]{53}$/)
  .refine((hash) => {
    const cost = Number(hash.slice(4, 6));
    return cost >= 4 && cost <= 31;
  }, "Hash bcrypt inválido.");

const emailSchema = z
  .string()
  .trim()
  .pipe(z.email("E-mail inválido.").max(254))
  .transform((value) => value.toLowerCase());

export const registrationSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório.").max(120),
  email: emailSchema,
  password: strongPasswordSchema,
  confirmPassword: z.string(),
  companyName: z.string().trim().min(1, "Nome da empresa é obrigatório.").max(120),
  phone: z.string().trim().min(10, "Telefone inválido.").max(32),
}).strict().refine((value) => value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "As senhas não coincidem.",
});

// NextAuth includes csrfToken, callbackUrl and json in the credentials payload.
export const loginCredentialsSchema = z.object({
  email: emailSchema,
  // Login accepts existing passwords regardless of the current signup policy.
  password: z.string().min(1, "Senha inválida.")
    .refine((value) => Buffer.byteLength(value, "utf8") <= 72, "Senha inválida."),
});

export const forgotPasswordSchema = z.object({ email: emailSchema }).strict();

export const resetPasswordSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/i, "Token inválido."),
  password: strongPasswordSchema,
}).strict();

export async function parseAuthJson<T extends z.ZodType>(request: Request, schema: T) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { success: false as const, error: "JSON inválido." };
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      success: false as const,
      error: result.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }
  return { success: true as const, data: result.data as z.output<T> };
}
