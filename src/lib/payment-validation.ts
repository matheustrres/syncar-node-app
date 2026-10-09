import { z } from "zod";

const idSchema = z.string().min(1).max(30).regex(/^[A-Za-z0-9_-]+$/, "ID de pagamento inválido.");
const dateSchema = z.string().refine((value) => {
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z)?$/.test(value)) return false;
  const date = new Date(value.length === 10 ? `${value}T00:00:00.000Z` : value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value.slice(0, 10);
}, "Data inválida.");

export const paymentIdSchema = idSchema;
export const paymentUpdateSchema = z.object({
  contractId: idSchema.optional(),
  weekStart: dateSchema.optional(),
  weekEnd: dateSchema.optional(),
  value: z.number().finite().positive("Valor deve ser maior que zero.").max(100_000_000).optional(),
  dueDate: dateSchema.optional(),
  paymentDate: dateSchema.nullable().optional().refine((value) => value === undefined || value === null || dateSchema.safeParse(value).success, "Data do pagamento inválida."),
  status: z.enum(["Pago", "Pendente"]).optional(),
}).strict().refine((data) => Object.keys(data).length > 0, "Informe ao menos um campo para atualizar.").superRefine((data, ctx) => {
  if (data.weekStart && data.weekEnd && data.weekStart > data.weekEnd) {
    ctx.addIssue({ code: "custom", path: ["weekStart"], message: "O início da semana não pode ser posterior ao fim." });
  }
});

export async function parsePaymentJson<T extends z.ZodType>(request: Request, schema: T) {
  let body: unknown;
  try { body = await request.json(); } catch { return { success: false as const, error: "JSON inválido." }; }
  const result = schema.safeParse(body);
  if (!result.success) return { success: false as const, error: result.error.issues[0]?.message ?? "Dados inválidos." };
  return { success: true as const, data: result.data as z.output<T> };
}
