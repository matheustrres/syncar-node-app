import { z } from "zod";

const idSchema = z.string().min(1).max(30).regex(/^[A-Za-z0-9_-]+$/, "ID inválido.");
const dateSchema = z.string().refine((value) => {
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z)?$/.test(value)) return false;
  const date = new Date(value.length === 10 ? `${value}T00:00:00.000Z` : value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value.slice(0, 10);
}, "Data de início inválida.");
const paymentDaySchema = z.enum(["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"]);
const contractStatusSchema = z.enum(["Ativo", "Encerrado"]);

export const contractIdSchema = idSchema;
export const contractBodySchema = z.object({
  vehicleId: idSchema,
  driverId: idSchema,
  weeklyValue: z.number().finite().positive("Valor semanal deve ser maior que zero.").max(100_000_000),
  paymentDay: paymentDaySchema,
  startDate: dateSchema,
  deposit: z.number().finite().min(0, "Caução não pode ser negativa.").max(100_000_000),
  status: contractStatusSchema,
  duration: z.number().int().min(1).max(520).nullable(),
}).strict();

const optionalBound = z.string().regex(/^\d+(?:\.\d{1,2})?$/).transform(Number).pipe(z.number().finite().min(0).max(100_000_000)).optional();
const optionalDate = dateSchema.optional();
export const contractListQuerySchema = z.object({
  page: z.preprocess((value) => value === undefined ? "1" : value, z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100_000))),
  limit: z.preprocess((value) => value === undefined ? "10" : value, z.string().regex(/^\d+$/).transform(Number).pipe(z.number().int().min(1).max(100))),
  sortColumn: z.enum(["createdAt", "startDate", "weeklyValue", "duration", "status", "driver.name", "vehicle.plate", "vehicle.model"]).optional().default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
  driverName: z.string().trim().max(120).optional(),
  vehiclePlate: z.string().trim().max(20).optional(),
  vehicleModel: z.string().trim().max(100).optional(),
  status: contractStatusSchema.optional().or(z.literal("")),
  weeklyValueMin: optionalBound,
  weeklyValueMax: optionalBound,
  startDateStartDate: optionalDate,
  startDateEndDate: optionalDate,
}).strict().superRefine((query, ctx) => {
  if (query.weeklyValueMin !== undefined && query.weeklyValueMax !== undefined && query.weeklyValueMin > query.weeklyValueMax) {
    ctx.addIssue({ code: "custom", path: ["weeklyValueMin"], message: "O valor mínimo não pode ser maior que o máximo." });
  }
  if (query.startDateStartDate && query.startDateEndDate && query.startDateStartDate > query.startDateEndDate) {
    ctx.addIssue({ code: "custom", path: ["startDateStartDate"], message: "A data inicial não pode ser posterior à data final." });
  }
});

export const contractIdsSchema = z.object({
  ids: z.array(idSchema).min(1).max(100).refine((ids) => new Set(ids).size === ids.length, "A lista contém IDs duplicados."),
}).strict();

export async function parseContractJson<T extends z.ZodType>(request: Request, schema: T) {
  let body: unknown;
  try { body = await request.json(); } catch { return { success: false as const, error: "JSON inválido." }; }
  const result = schema.safeParse(body);
  if (!result.success) return { success: false as const, error: result.error.issues[0]?.message ?? "Dados inválidos." };
  return { success: true as const, data: result.data as z.output<T> };
}
