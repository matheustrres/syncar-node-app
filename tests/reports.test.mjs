import test from 'node:test';
import assert from 'node:assert/strict';
import { groupOverduePayments } from '../src/app/dashboard/reports/report-data.ts';

const payment = (id, driverId, value, dueDate = '2026-08-01', daysOverdue = 10) => ({
  id, driverId, value, dueDate, daysOverdue, driverName: 'Carlos Pereira',
  vehicleInfo: 'ABC1D23 - Argo', weekStart: new Date('2026-07-25'), weekEnd: new Date('2026-07-31'),
});

test('overdue groups keep namesakes separate and preserve every payment', () => {
  const rows = [payment('a', 'driver-1', 100), payment('b', 'driver-1', 200), payment('c', 'driver-2', 300)];
  const before = structuredClone(rows);
  const groups = groupOverduePayments(rows);
  assert.equal(groups.length, 2);
  assert.deepEqual(groups.map(group => group.total), [300, 300]);
  assert.deepEqual(groups.flatMap(group => group.payments.map(row => row.id)), ['a', 'b', 'c']);
  assert.deepEqual(rows, before);
});

test('oldest due date leads details; receipt removal updates total and removes empty group', () => {
  const rows = [payment('a', 'driver-1', 100, '2026-09-01', 5), payment('b', 'driver-1', 200, '2026-08-01', 36)];
  const [group] = groupOverduePayments(rows);
  assert.deepEqual(group.payments.map(row => row.id), ['b', 'a']);
  assert.equal(group.days, 36);
  assert.equal(groupOverduePayments(rows.slice(0, 1))[0].total, 100);
  assert.deepEqual(groupOverduePayments([]), []);
});

test('older cached payloads without driver IDs are never merged by name', () => {
  assert.equal(groupOverduePayments([payment('a', undefined, 100), payment('b', undefined, 200)]).length, 2);
});
