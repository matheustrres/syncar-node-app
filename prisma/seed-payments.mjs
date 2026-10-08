const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const dayMs = 86400000;

/** Build only missing installments. Existing receipts and pending installments are immutable. */
export function buildSeedPayments(contract, existingPayments, now = new Date()) {
  const start = new Date(contract.startDate);
  start.setUTCHours(0, 0, 0, 0);
  const paymentDay = weekdays.indexOf(contract.paymentDay);
  if (paymentDay < 0 || !Number.isFinite(start.getTime())) throw new Error('Calendário do contrato inválido.');
  const offset = (paymentDay - start.getUTCDay() + 7) % 7 || 7;
  const firstDue = start.getTime() + offset * dayMs;
  const existingDays = new Set(existingPayments.map(item => new Date(item.dueDate).toISOString().slice(0, 10)));
  const payments = [];
  for (let week = 0; week < contract.duration; week++) {
    const dueDate = new Date(firstDue + week * 7 * dayMs);
    const day = dueDate.toISOString().slice(0, 10);
    if (existingDays.has(day)) continue;
    // Most past installments are received, with a minority of overdue examples.
    const paid = dueDate < now && (week + contract.daysRunning) % 4 !== 0;
    payments.push({
      id: `seed-${contract.id}-${day}`,
      contractId: contract.id,
      dueDate,
      weekStart: new Date(dueDate.getTime() - 6 * dayMs),
      weekEnd: new Date(dueDate),
      value: contract.weeklyValue,
      status: paid ? 'Pago' : 'Pendente',
      paymentDate: paid ? new Date(dueDate.getTime() - ((week + contract.daysRunning) % 3) * dayMs) : null,
    });
  }
  return payments;
}
