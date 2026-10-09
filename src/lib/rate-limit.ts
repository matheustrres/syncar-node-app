import { createHmac } from "crypto";
import { createClient, type RedisClientType } from "redis";

type RateLimitPolicy = {
  limit: number;
  windowMs: number;
};

const policies = {
  loginIp: { limit: 30, windowMs: 15 * 60 * 1000 },
  loginAccount: { limit: 10, windowMs: 15 * 60 * 1000 },
  registerIp: { limit: 5, windowMs: 60 * 60 * 1000 },
  forgotIp: { limit: 5, windowMs: 60 * 60 * 1000 },
  forgotAccount: { limit: 3, windowMs: 60 * 60 * 1000 },
  resetIp: { limit: 10, windowMs: 15 * 60 * 1000 },
  resetToken: { limit: 5, windowMs: 15 * 60 * 1000 },
} satisfies Record<string, RateLimitPolicy>;

type RateLimitBucket = {
  scope: keyof typeof policies;
  value: string;
};

const incrementWithWindowScript = `
  local count = redis.call("INCR", KEYS[1])
  if count == 1 then
    redis.call("PEXPIRE", KEYS[1], ARGV[1])
  end
  return { count, redis.call("PTTL", KEYS[1]) }
`;

const globalForRedis = globalThis as typeof globalThis & {
  authRateLimitRedis?: RedisClientType;
  authRateLimitRedisConnection?: Promise<void>;
};

function getRedisClient(): RedisClientType {
  if (globalForRedis.authRateLimitRedis) return globalForRedis.authRateLimitRedis;

  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL é obrigatório para rate limit.");

  const client = createClient({ url });
  client.on("error", (error) => {
    console.error("Erro na conexão Redis do rate limit:", error);
  });
  globalForRedis.authRateLimitRedis = client;
  return client;
}

async function ensureRedisConnection(client: RedisClientType): Promise<void> {
  if (client.isReady) return;

  if (!globalForRedis.authRateLimitRedisConnection) {
    globalForRedis.authRateLimitRedisConnection = client
      .connect()
      .then(() => undefined)
      .finally(() => {
        globalForRedis.authRateLimitRedisConnection = undefined;
      });
  }

  await globalForRedis.authRateLimitRedisConnection;
}

function digestBucket(bucket: RateLimitBucket): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET é obrigatório para rate limit.");

  return createHmac("sha256", secret)
    .update(`${bucket.scope}:${bucket.value}`)
    .digest("hex");
}

export function getClientIp(headers: Headers): string {
  const realIp = headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 128);

  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const addresses = forwardedFor.split(",").map((address) => address.trim());
    const clientIp = addresses.at(-1);
    if (clientIp) return clientIp.slice(0, 128);
  }

  return "unknown";
}

export async function consumeRateLimits(
  buckets: RateLimitBucket[]
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const client = getRedisClient();
  await ensureRedisConnection(client);

  let longestRetry = 0;

  for (const bucket of buckets) {
    const policy = policies[bucket.scope];
    const result = (await client.eval(incrementWithWindowScript, {
      keys: [`syncar:rate-limit:${digestBucket(bucket)}`],
      arguments: [String(policy.windowMs)],
    })) as [number, number];
    const [count, ttlMs] = result;

    if (count > policy.limit) {
      longestRetry = Math.max(longestRetry, Math.ceil(Math.max(ttlMs, 1000) / 1000));
    }
  }

  return longestRetry > 0
    ? { allowed: false, retryAfterSeconds: longestRetry }
    : { allowed: true, retryAfterSeconds: 0 };
}
