export interface FinancialFilters { from?: string; to?: string; situation?: string; category?: string }
export function utcDay(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value ? date : undefined;
}
export function dateRange(filters: FinancialFilters) {
  const gte = utcDay(filters.from);
  const end = utcDay(filters.to);
  const lt = end ? new Date(end.getTime() + 86400000) : undefined;
  return gte || lt ? { gte, lt } : undefined;
}
export function financialToday() {
  // Calendar dates throughout the financial lists use UTC, including the client formatter.
  return new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00Z');
}
export function readFinancialFilters(params: URLSearchParams): FinancialFilters {
  return { from: params.get('from') || '', to: params.get('to') || '', situation: params.get('situation') || '', category: params.get('category') || '' };
}
export const expenseLabels: Record<string, string> = {
  COMBUSTIVEL: 'Combustível', LIMPEZA: 'Limpeza', PEDAGIO: 'Pedágio', MANUTENCAO: 'Manutenção', DOCUMENTACAO: 'Documentação', PECAS: 'Peças', TROCA_OLEO: 'Troca de óleo', PREVENTIVA: 'Preventiva', CORRETIVA: 'Corretiva', PNEUS: 'Pneus', FREIOS: 'Freios', OUTROS: 'Outros',
};
export const expenseLabel = (value: string) => expenseLabels[value] || value;
