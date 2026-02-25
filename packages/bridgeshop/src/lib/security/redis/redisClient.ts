/**
 * redisClient.ts
 * Singleton Redis client for BridgeShop.
 * Used by: sessions, JWT blacklist, rate limiting store.
 */
import { createClient, type RedisClientType } from 'redis';

let client: RedisClientType | null = null;

/**
 * Returns the shared Redis client instance.
 * Connects on first call, reuses on subsequent calls.
 */
export function getRedisClient(): RedisClientType {
  if (!client) {
    client = createClient({
      socket: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000)
      },
      password: process.env.REDIS_PASSWORD || undefined
    }) as RedisClientType;

    client.on('error', (err) => {
      console.error('[Redis] Connection error:', err.message);
    });
    client.on('ready', () => {
      console.info('[Redis] Connected successfully');
    });

    // Connect (non-blocking — errors are handled by the error event)
    client.connect().catch((err) => {
      console.error('[Redis] Initial connect failed:', err.message);
    });
  }
  return client;
}

/** Gracefully disconnect Redis on app shutdown */
export async function disconnectRedis(): Promise<void> {
  if (client?.isOpen) {
    await client.quit();
    client = null;
  }
}
