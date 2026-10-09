import { createClient, type RedisClientType } from "redis";

type CacheRead<T> = { value: T | null; version: string | null; readCompletedAt: number };
type CacheScope = "vehicles" | "maintenance" | "contracts" | "drivers" | "financial" | "reports" | "dashboard";
type CacheMetricScope = CacheScope | "overdue-payments";
type CacheMetrics = {
  hits: number;
  misses: number;
  bypasses: number;
  loads: number;
  loadMsTotal: number;
  loadMsMax: number;
};

const CACHE_TTL_SECONDS: Record<CacheScope, number> = {
  vehicles: 300,
  maintenance: 300,
  contracts: 300,
  drivers: 300,
  financial: 60,
  reports: 300,
  dashboard: 30,
};
const OVERDUE_PAYMENTS_TTL_SECONDS = 30;
const CACHE_METRICS_INTERVAL_MS = 60_000;

const globalForRedisCache = globalThis as typeof globalThis & {
  syncarCacheRedis?: RedisClientType;
  syncarCacheRedisConnection?: Promise<void>;
  syncarCacheMetrics?: Partial<Record<CacheMetricScope, CacheMetrics>>;
  syncarCacheMetricsInterval?: ReturnType<typeof setInterval>;
};

const READ_CACHE_SCRIPT = `
local version = redis.call('GET', KEYS[1]) or '0'
return {version, redis.call('GET', KEYS[2] .. ':v:' .. version)}
`;

const WRITE_CACHE_SCRIPT = `
local version = redis.call('GET', KEYS[1]) or '0'
if version ~= ARGV[1] then return 0 end
redis.call('SET', KEYS[2] .. ':v:' .. version, ARGV[2], 'EX', ARGV[3])
return 1
`;

function getRedisClient(): RedisClientType | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  if (globalForRedisCache.syncarCacheRedis) return globalForRedisCache.syncarCacheRedis;

  const client = createClient({
    url,
    disableOfflineQueue: true,
    socket: {
      connectTimeout: 1000,
      reconnectStrategy: false,
    },
  });
  client.on("error", (error) => {
    console.error("Erro na conexão Redis do cache:", error);
  });
  globalForRedisCache.syncarCacheRedis = client;
  return client;
}

async function ensureRedisConnection(client: RedisClientType): Promise<void> {
  if (client.isReady) return;

  if (!globalForRedisCache.syncarCacheRedisConnection) {
    globalForRedisCache.syncarCacheRedisConnection = client
      .connect()
      .then(() => undefined)
      .finally(() => {
        globalForRedisCache.syncarCacheRedisConnection = undefined;
      });
  }

  await globalForRedisCache.syncarCacheRedisConnection;
}

function cacheKeyParts(key: string): { scope: CacheScope; userId: string } {
  const parts = key.split(":", 4);
  if (parts[0] !== "syncar" || parts[1] !== "cache" ||
    !Object.hasOwn(CACHE_TTL_SECONDS, parts[2]) || !parts[3]) {
    throw new Error(`Chave de cache inválida: ${key}`);
  }
  return { scope: parts[2] as CacheScope, userId: parts[3] };
}

function cacheVersionKey(key: string): string {
  const { scope, userId } = cacheKeyParts(key);
  return `syncar:cache:version:${scope}:${userId}`;
}

export function getCacheTtlSeconds(key: string): number {
  const { scope } = cacheKeyParts(key);
  if (scope === "reports" && key.endsWith(":overdue-payments")) {
    return OVERDUE_PAYMENTS_TTL_SECONDS;
  }
  return CACHE_TTL_SECONDS[scope];
}

function cacheMetricScope(key: string): CacheMetricScope {
  const { scope } = cacheKeyParts(key);
  return scope === "reports" && key.endsWith(":overdue-payments") ? "overdue-payments" : scope;
}

function recordCacheMetric(key: string, event: "hit" | "miss" | "bypass" | "load", loadMs = 0): void {
  if (process.env.CACHE_METRICS_ENABLED !== "true") return;

  const metricsByScope = globalForRedisCache.syncarCacheMetrics ??= {};
  const scope = cacheMetricScope(key);
  const metrics = metricsByScope[scope] ??= {
    hits: 0, misses: 0, bypasses: 0, loads: 0, loadMsTotal: 0, loadMsMax: 0,
  };
  if (event === "hit") metrics.hits++;
  if (event === "miss") metrics.misses++;
  if (event === "bypass") metrics.bypasses++;
  if (event === "load") {
    metrics.loads++;
    metrics.loadMsTotal += loadMs;
    metrics.loadMsMax = Math.max(metrics.loadMsMax, loadMs);
  }

  if (!globalForRedisCache.syncarCacheMetricsInterval) {
    globalForRedisCache.syncarCacheMetricsInterval = setInterval(() => {
      const snapshot = globalForRedisCache.syncarCacheMetrics ?? {};
      globalForRedisCache.syncarCacheMetrics = {};
      for (const [name, entry] of Object.entries(snapshot)) {
        if (!entry) continue;
        const requests = entry.hits + entry.misses + entry.bypasses;
        console.info("Métricas do cache Redis:", JSON.stringify({
          scope: name,
          windowSeconds: CACHE_METRICS_INTERVAL_MS / 1000,
          requests,
          hits: entry.hits,
          misses: entry.misses,
          bypasses: entry.bypasses,
          hitRate: requests ? Number((entry.hits / requests).toFixed(3)) : 0,
          loads: entry.loads,
          loadMsAvg: entry.loads ? Math.round(entry.loadMsTotal / entry.loads) : 0,
          loadMsMax: Math.round(entry.loadMsMax),
        }));
      }
    }, CACHE_METRICS_INTERVAL_MS);
    globalForRedisCache.syncarCacheMetricsInterval.unref();
  }
}

export async function getRedisCache<T>(key: string): Promise<CacheRead<T>> {
  const client = getRedisClient();
  if (!client) {
    recordCacheMetric(key, "bypass");
    return { value: null, version: null, readCompletedAt: performance.now() };
  }

  try {
    await ensureRedisConnection(client);
    const [version, value] = (await client.eval(READ_CACHE_SCRIPT, {
      keys: [cacheVersionKey(key), key],
    })) as [string, string | null];
    const parsedValue = value === null ? null : (JSON.parse(value) as T);
    recordCacheMetric(key, value === null ? "miss" : "hit");
    return { value: parsedValue, version, readCompletedAt: performance.now() };
  } catch (error) {
    console.error("Falha ao ler cache Redis:", error);
    recordCacheMetric(key, "bypass");
    return { value: null, version: null, readCompletedAt: performance.now() };
  }
}

export async function setRedisCache<T>(
  key: string,
  value: T,
  cacheRead: CacheRead<unknown>
): Promise<void> {
  recordCacheMetric(key, "load", performance.now() - cacheRead.readCompletedAt);
  if (cacheRead.version === null) return;
  const client = getRedisClient();
  if (!client) return;

  try {
    await ensureRedisConnection(client);
    await client.eval(WRITE_CACHE_SCRIPT, {
      keys: [cacheVersionKey(key), key],
      arguments: [cacheRead.version, JSON.stringify(value), String(getCacheTtlSeconds(key))],
    });
  } catch (error) {
    console.error("Falha ao gravar cache Redis:", error);
  }
}

async function invalidateScopes(userId: string, scopes: CacheScope[], label: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    await ensureRedisConnection(client);
    const transaction = client.multi();
    for (const scope of scopes) {
      transaction.incr(`syncar:cache:version:${scope}:${userId}`);
    }
    await transaction.exec();
  } catch (error) {
    console.error(`Falha ao invalidar cache de ${label}:`, error);
  }
}

export async function invalidateVehicleCaches(userId: string): Promise<void> {
  await invalidateScopes(userId, ["vehicles", "maintenance", "contracts", "financial", "reports", "dashboard"], "veículos");
}

export async function invalidateMaintenanceCaches(userId: string): Promise<void> {
  await invalidateScopes(userId, ["maintenance", "financial", "reports", "dashboard"], "manutenções");
}

export async function invalidateDriverCaches(userId: string): Promise<void> {
  await invalidateScopes(userId, ["drivers", "contracts", "financial", "reports", "dashboard"], "motoristas");
}

export async function invalidateContractCaches(userId: string): Promise<void> {
  await invalidateScopes(userId, ["contracts", "financial", "reports", "dashboard"], "contratos");
}

export async function invalidateFinancialCaches(userId: string): Promise<void> {
  await invalidateScopes(userId, ["financial", "reports", "dashboard"], "financeiro");
}
