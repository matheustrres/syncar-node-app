import { z } from "zod";

const vehicleStatusSchema = z.enum(["Disponível", "Alugado", "Manutenção"]);
const currentYear = new Date().getFullYear();

const vehicleFields = {
  plate: z.string().trim().toUpperCase().regex(
    /^(?:[A-Z]{3}-?[0-9]{4}|[A-Z]{3}[0-9][A-Z][0-9]{2})$/,
    "Placa inválida.",
  ),
  brand: z.string().trim().min(1, "Marca é obrigatória.").max(80, "Marca deve ter no máximo 80 caracteres."),
  model: z.string().trim().min(1, "Modelo é obrigatório.").max(100, "Modelo deve ter no máximo 100 caracteres."),
  year: z.number().int().min(1886, "Ano inválido.").max(currentYear + 1, "Ano não pode ser futuro."),
  color: z.string().trim().min(1, "Cor é obrigatória.").max(40, "Cor deve ter no máximo 40 caracteres."),
  renavam: z.string().trim().transform((value) => value || null).pipe(
    z.string().regex(/^\d{11}$/, "RENAVAM deve conter 11 dígitos.").nullable(),
  ).nullable().optional(),
  chassis: z.string().trim().toUpperCase().transform((value) => value || null).pipe(
    z.string().regex(/^[A-HJ-NPR-Z0-9]{17}$/, "Chassi deve conter 17 caracteres válidos.").nullable(),
  ).nullable().optional(),
  km: z.number().int().min(0, "Quilometragem não pode ser negativa.").max(2_147_483_647, "Quilometragem inválida."),
  status: vehicleStatusSchema,
};

export const vehicleCreateSchema = z.object(vehicleFields);

export const vehicleUpdateSchema = z.object(vehicleFields).partial().refine(
  (data) => Object.keys(data).length > 0,
  "Informe ao menos um campo para atualizar.",
);

export const vehicleIdsSchema = z.array(z.string().min(1).max(30)).min(1).max(100)
  .refine((ids) => new Set(ids).size === ids.length, "A lista contém IDs duplicados.");

export const vehicleIdSchema = z.string().min(1).max(30).regex(/^[A-Za-z0-9_-]+$/, "ID de veículo inválido.");

export const vehicleCatalogQuerySchema = z.object({
  brand: z.string().regex(/^\d{1,10}$/, "Marca inválida.").optional(),
}).strict();

const optionalTextFilter = z.string().max(100).transform((value) => value.trim()).optional();
const optionalBound = z.string().regex(/^\d+$/).transform(Number).optional();

export const vehicleListQuerySchema = z.object({
  page: z.preprocess((value) => value === undefined ? "1" : value,
    z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100_000))),
  limit: z.preprocess((value) => value === undefined ? "10" : value,
    z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100))),
  sortColumn: z.enum(["createdAt", "plate", "brand", "model", "status"]).optional().default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
  plate: optionalTextFilter,
  brand: optionalTextFilter,
  model: optionalTextFilter,
  status: vehicleStatusSchema.optional().or(z.literal("")),
  yearMin: optionalBound,
  yearMax: optionalBound,
  kmMin: optionalBound,
  kmMax: optionalBound,
}).strict().superRefine((query, ctx) => {
  for (const field of ["year", "km"] as const) {
    const min = query[`${field}Min`];
    const max = query[`${field}Max`];
    const minimum = field === "year" ? 1886 : 0;
    const maximum = field === "year" ? currentYear + 1 : 2_147_483_647;
    for (const [bound, value] of [[`${field}Min`, min], [`${field}Max`, max]] as const) {
      if (value !== undefined && (value < minimum || value > maximum)) {
        ctx.addIssue({ code: "custom", path: [bound], message: `Filtro ${field} fora do limite permitido.` });
      }
    }
    if (min !== undefined && max !== undefined && min > max) {
      ctx.addIssue({ code: "custom", path: [`${field}Min`], message: `O limite mínimo de ${field} não pode ser maior que o máximo.` });
    }
  }
});

export async function parseJsonBody<T extends z.ZodType>(request: Request, schema: T) {
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
