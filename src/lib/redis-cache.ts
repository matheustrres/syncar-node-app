import { createClient, type RedisClientType } from "redis";

type CacheRead<T> = { value: T | null; version: string | null };
type CacheScope = "vehicles" | "maintenance" | "contracts" | "drivers" | "financial" | "reports" | "dashboard";

const globalForRedisCache = globalThis as typeof globalThis & {
  syncarCacheRedis?: RedisClientType;
  syncarCacheRedisConnection?: Promise<void>;
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

function cacheVersionKey(key: string): string {
  const parts = key.split(":", 4);
  if (parts[0] !== "syncar" || parts[1] !== "cache" || !parts[2] || !parts[3]) {
    throw new Error(`Chave de cache inválida: ${key}`);
  }
  return `syncar:cache:version:${parts[2]}:${parts[3]}`;
}

export async function getRedisCache<T>(key: string): Promise<CacheRead<T>> {
  const client = getRedisClient();
  if (!client) return { value: null, version: null };

  try {
    await ensureRedisConnection(client);
    const [version, value] = (await client.eval(READ_CACHE_SCRIPT, {
      keys: [cacheVersionKey(key), key],
    })) as [string, string | null];
    return { value: value === null ? null : (JSON.parse(value) as T), version };
  } catch (error) {
    console.error("Falha ao ler cache Redis:", error);
    return { value: null, version: null };
  }
}

export async function setRedisCache<T>(
  key: string,
  value: T,
  ttlSeconds: number,
  version: string | null
): Promise<void> {
  if (version === null) return;
  const client = getRedisClient();
  if (!client) return;

  try {
    await ensureRedisConnection(client);
    await client.eval(WRITE_CACHE_SCRIPT, {
      keys: [cacheVersionKey(key), key],
      arguments: [version, JSON.stringify(value), String(ttlSeconds)],
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
