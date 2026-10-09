import { z } from "zod";

const maintenanceTypeSchema = z.enum([
  "PREVENTIVA",
  "CORRETIVA",
  "TROCA_OLEO",
  "PNEUS",
  "FREIOS",
  "OUTROS",
]);

export const maintenanceIdSchema = z.string().min(1).max(30).regex(/^[A-Za-z0-9_-]+$/, "ID de manutenção inválido.");
const vehicleIdSchema = z.string().min(1).max(30).regex(/^[A-Za-z0-9_-]+$/, "ID de veículo inválido.");
const dateSchema = z.string().refine((value) => {
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z)?$/.test(value)) return false;
  const date = new Date(value.length === 10 ? `${value}T00:00:00.000Z` : value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value.slice(0, 10);
}, "Data inválida.");

const numericInput = (schema: z.ZodNumber) => z.union([z.number(), z.string().trim().min(1)]).transform(Number).pipe(schema);

export const maintenanceBodySchema = z.object({
  vehicleId: vehicleIdSchema,
  type: maintenanceTypeSchema,
  description: z.string().trim().max(500, "Descrição deve ter no máximo 500 caracteres.").optional().default(""),
  cost: numericInput(z.number().finite().positive("Custo deve ser maior que zero.").max(100_000_000)),
  date: dateSchema,
  mileage: numericInput(z.number().int().min(1, "Quilometragem deve ser maior que zero.").max(2_147_483_647)),
  nextServiceMileage: z.union([z.number(), z.string().trim().min(1)]).transform(Number)
    .pipe(z.number().int().min(0).max(2_147_483_647)).nullable().optional(),
  nextServiceDate: dateSchema.nullable().optional(),
  notes: z.string().trim().max(2000, "Observações devem ter no máximo 2.000 caracteres.").nullable().optional(),
}).strict();

const optionalText = z.string().trim().max(100).optional();
const optionalCost = z.string().regex(/^\d+(?:\.\d{1,2})?$/).transform(Number).pipe(z.number().finite().min(0).max(100_000_000)).optional();
const optionalMileage = z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(0).max(2_147_483_647)).optional();
const optionalDate = dateSchema.optional();

export const maintenanceListQuerySchema = z.object({
  page: z.preprocess((value) => value === undefined ? "1" : value, z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100_000))),
  limit: z.preprocess((value) => value === undefined ? "10" : value, z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100))),
  sortColumn: z.enum(["date", "type", "description", "cost", "mileage", "vehicle.plate", "vehicle.model"]).optional().default("date"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
  vehicleId: vehicleIdSchema.optional(),
  vehicle: optionalText,
  type: maintenanceTypeSchema.optional().or(z.literal("")),
  costMin: optionalCost,
  costMax: optionalCost,
  mileageMin: optionalMileage,
  mileageMax: optionalMileage,
  dateStartDate: optionalDate,
  dateEndDate: optionalDate,
}).strict().superRefine((query, ctx) => {
  for (const [minKey, maxKey] of [["costMin", "costMax"], ["mileageMin", "mileageMax"]] as const) {
    const min = query[minKey];
    const max = query[maxKey];
    if (min !== undefined && max !== undefined && min > max) {
      ctx.addIssue({ code: "custom", path: [minKey], message: "O valor mínimo não pode ser maior que o máximo." });
    }
  }
  if (query.dateStartDate && query.dateEndDate && query.dateStartDate > query.dateEndDate) {
    ctx.addIssue({ code: "custom", path: ["dateStartDate"], message: "A data inicial não pode ser posterior à data final." });
  }
});

export const maintenanceIdsSchema = z.object({
  ids: z.array(maintenanceIdSchema).min(1).max(100)
    .refine((ids) => new Set(ids).size === ids.length, "A lista contém IDs duplicados."),
}).strict();

export async function parseMaintenanceJson<T extends z.ZodType>(request: Request, schema: T) {
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
