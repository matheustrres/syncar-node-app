import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { RedisContainer } from '@testcontainers/redis';
import {
  getRedisCache,
  setRedisCache,
  invalidateVehicleCaches,
  invalidateFinancialCaches,
} from '../../src/lib/redis-cache.ts';

let container;

test.before(async () => {
  container = await new RedisContainer('redis:7-alpine').start();
  process.env.REDIS_URL = container.getConnectionUrl();
});

test.after(async () => {
  globalThis.syncarCacheRedis?.destroy();
  await container?.stop();
});

test('invalidação não permite que leitura antiga regrave dados obsoletos', async () => {
  const userId = randomUUID();
  const key = `syncar:cache:dashboard:${userId}`;
  const firstRead = await getRedisCache(key);
  assert.equal(firstRead.value, null);
  assert.equal(firstRead.version, '0');

  await invalidateVehicleCaches(userId);
  await setRedisCache(key, { total: 1 }, 15, firstRead.version);
  assert.equal((await getRedisCache(key)).value, null);

  const secondRead = await getRedisCache(key);
  await setRedisCache(key, { total: 2 }, 15, secondRead.version);
  assert.deepEqual((await getRedisCache(key)).value, { total: 2 });
});

test('invalidação financeira afeta apenas os escopos e usuário corretos', async () => {
  const userId = randomUUID();
  const otherUserId = randomUUID();
  const financialKey = `syncar:cache:financial:${userId}:summary`;
  const vehicleKey = `syncar:cache:vehicles:${userId}:all`;
  const otherFinancialKey = `syncar:cache:financial:${otherUserId}:summary`;

  for (const key of [financialKey, vehicleKey, otherFinancialKey]) {
    const read = await getRedisCache(key);
    await setRedisCache(key, { key }, 15, read.version);
  }

  await invalidateFinancialCaches(userId);
  assert.equal((await getRedisCache(financialKey)).value, null);
  assert.deepEqual((await getRedisCache(vehicleKey)).value, { key: vehicleKey });
  assert.deepEqual((await getRedisCache(otherFinancialKey)).value, { key: otherFinancialKey });
});
