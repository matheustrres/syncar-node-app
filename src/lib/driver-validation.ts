import { z } from "zod";

const driverStatusSchema = z.enum(["Ativo", "Inativo"]);
const idSchema = z.string().min(1).max(30).regex(/^[A-Za-z0-9_-]+$/, "ID de motorista inválido.");
const requiredText = (label: string, max: number) => z.string().trim().min(1, `${label} é obrigatório.`).max(max, `${label} deve ter no máximo ${max} caracteres.`);
const nullableText = (label: string, max: number) => z.string().trim().max(max, `${label} deve ter no máximo ${max} caracteres.`).nullable().optional();
const optionalDate = z.preprocess((value) => value === "" ? null : value,
  z.string().refine((value) => {
    if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z)?$/.test(value)) return false;
    const date = new Date(value.length === 10 ? `${value}T00:00:00.000Z` : value);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value.slice(0, 10);
  }, "Validade da CNH inválida.").nullable().optional(),
);

function isValidCpf(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (!/^\d{11}$/.test(digits) || /^([0-9])\1{10}$/.test(digits)) return false;
  const digit = (length: number) => {
    const sum = digits.slice(0, length).split("").reduce((total, number, index) => total + Number(number) * (length + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  return digit(9) === Number(digits[9]) && digit(10) === Number(digits[10]);
}

const driverFields = {
  name: requiredText("Nome", 120),
  // Kept optional for compatibility with the existing form; the server always derives it from name.
  nameNormalized: z.string().max(200).optional(),
  cpf: z.string().trim().refine(isValidCpf, "CPF inválido."),
  phone: z.string().trim().refine((value) => /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(value), "Telefone inválido."),
  email: z.email("E-mail inválido.").max(254).transform((value) => value.trim().toLowerCase()),
  cnh: z.union([z.string().trim().regex(/^\d{11}$/, "CNH deve conter 11 dígitos."), z.literal("")]).nullable().optional()
    .transform((value) => value || null),
  cnhValidity: optionalDate,
  cep: requiredText("CEP", 9).refine((value) => /^\d{5}-?\d{3}$/.test(value), "CEP deve conter 8 dígitos."),
  logradouro: requiredText("Logradouro", 160),
  numero: requiredText("Número", 20),
  complemento: nullableText("Complemento", 100),
  bairro: requiredText("Bairro", 100),
  cidade: requiredText("Cidade", 100),
  uf: z.string().trim().toUpperCase().regex(/^[A-Z]{2}$/, "UF deve conter 2 letras."),
  status: driverStatusSchema,
};

export const driverCreateSchema = z.object(driverFields).strict();
export const driverUpdateSchema = z.object(driverFields).partial().strict().refine(
  (data) => Object.keys(data).length > 0,
  "Informe ao menos um campo para atualizar.",
);
export const driverIdSchema = idSchema;
export const driverIdsSchema = z.object({
  ids: z.array(idSchema).min(1).max(100)
    .refine((ids) => new Set(ids).size === ids.length, "A lista contém IDs duplicados."),
}).strict();

export const driverListQuerySchema = z.object({
  page: z.preprocess((value) => value === undefined ? "1" : value, z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100_000))),
  limit: z.preprocess((value) => value === undefined ? "10" : value, z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100))),
  sortColumn: z.enum(["createdAt", "name", "cpf", "phone", "status"]).optional().default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
  name: z.string().trim().max(120).optional(),
  cpf: z.string().trim().max(20).optional(),
  phone: z.string().trim().max(24).optional(),
  email: z.string().trim().max(254).optional(),
  status: driverStatusSchema.optional().or(z.literal("")),
}).strict();

export async function parseDriverJson<T extends z.ZodType>(request: Request, schema: T) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { success: false as const, error: "JSON inválido." };
  }
  const result = schema.safeParse(body);
  if (!result.success) {
    return { success: false as const, error: result.error.issues[0]?.message ?? "Dados inválidos." };
  }
  return { success: true as const, data: result.data as z.output<T> };
}
