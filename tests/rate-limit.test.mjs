import test from 'node:test';
import assert from 'node:assert/strict';
import { getClientIp } from '../src/lib/rate-limit.ts';

test('usa x-real-ip quando presente', () => {
  assert.equal(getClientIp(new Headers({ 'x-real-ip': ' 192.0.2.1 ', 'x-forwarded-for': '198.51.100.1' })), '192.0.2.1');
});

test('usa o ultimo proxy em x-forwarded-for', () => {
  assert.equal(getClientIp(new Headers({ 'x-forwarded-for': '192.0.2.1, 198.51.100.1' })), '198.51.100.1');
});

test('usa unknown sem cabecalho de IP e limita o tamanho da chave', () => {
  assert.equal(getClientIp(new Headers()), 'unknown');
  assert.equal(getClientIp(new Headers({ 'x-real-ip': 'a'.repeat(200) })).length, 128);
});
