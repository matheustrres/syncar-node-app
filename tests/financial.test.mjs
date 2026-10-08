import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSeedPayments } from '../prisma/seed-payments.mjs';
import { utcDay, dateRange, readFinancialFilters, expenseLabel } from '../src/lib/financial-filters.ts';

const contract = { id: 'fixture', startDate: new Date('2026-07-09T17:42:00Z'), paymentDay: 'Sexta-feira', duration: 26, weeklyValue: 720, daysRunning: 91 };
const now = new Date('2026-10-08T12:00:00Z');

test('seed rerun across different days/hours creates no extra installments', () => {
  const first = buildSeedPayments(contract, [], now);
  const legacy = first.map(payment => ({ ...payment, dueDate: new Date(payment.dueDate.getTime() + 17 * 3600000) }));
  assert.equal(first.length, 26);
  assert.equal(first[0].dueDate.toISOString(), '2026-07-10T00:00:00.000Z');
  assert.deepEqual(buildSeedPayments(contract, legacy, new Date('2026-10-12T22:00:00Z')), []);
});

test('seed preserves paid values/dates and fills only genuinely missing installments', () => {
  const first = buildSeedPayments(contract, [], now);
  const paid = { ...first[0], value: 680, status: 'Pago', paymentDate: new Date('2026-07-12T10:00:00Z') };
  const existing = [paid, first[2]];
  const before = structuredClone(existing);
  const missing = buildSeedPayments(contract, existing, now);
  assert.equal(missing.length, 24);
  assert.equal(missing[0].dueDate.toISOString(), '2026-07-17T00:00:00.000Z');
  assert.deepEqual(existing, before);
  assert.equal(new Set([...existing, ...missing].map(item => item.id)).size, 26);
});

test('schedule has weekly spacing, deterministic IDs, receipts, overdue and future examples', () => {
  const payments = buildSeedPayments(contract, [], now);
  const historical = payments.filter(item => item.dueDate < now);
  assert.ok(historical.some(item => item.status === 'Pendente'));
  assert.ok(historical.filter(item => item.status === 'Pago').length > historical.length / 2);
  assert.ok(payments.filter(item => item.dueDate > now).every(item => item.status === 'Pendente' && !item.paymentDate));
  payments.forEach((item, index) => {
    assert.equal(item.dueDate.getUTCDay(), 5);
    assert.equal(item.weekEnd - item.weekStart, 6 * 86400000);
    assert.ok(!item.paymentDate || item.paymentDate <= item.dueDate);
    if (index) assert.equal(item.dueDate - payments[index - 1].dueDate, 7 * 86400000);
  });
  assert.deepEqual(payments.map(item => item.id), buildSeedPayments(contract, [], new Date('2026-11-01')).map(item => item.id));
});

test('contract starting on payment day first charges the following week', () => {
  const payments = buildSeedPayments({ ...contract, startDate: new Date('2026-07-10') }, [], now);
  assert.equal(payments[0].dueDate.toISOString(), '2026-07-17T00:00:00.000Z');
});

test('financial date filters include the full last day and reject impossible dates', () => {
  assert.equal(utcDay('2026-02-30'), undefined);
  assert.equal(utcDay('2026-10-01T10:00:00Z'), undefined);
  assert.equal(dateRange({}), undefined);
  const range = dateRange({ from: '2026-09-30', to: '2026-10-08' });
  assert.equal(range.gte.toISOString(), '2026-09-30T00:00:00.000Z');
  assert.equal(range.lt.toISOString(), '2026-10-09T00:00:00.000Z');
  assert.deepEqual(readFinancialFilters(new URLSearchParams('category=PEDAGIO&situation=overdue')), { from: '', to: '', category: 'PEDAGIO', situation: 'overdue' });
  assert.equal(expenseLabel('PEDAGIO'), 'Pedágio');
});
