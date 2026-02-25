/**
 * redisClient.ts
 * Cliente Redis singleton para BridgeShop.
 * Compartido por: sesiones, lista negra JWT, almacén de rate limiting.
 *
 * Patrón singleton: una sola conexión por proceso Node.js para eficiencia.
 * La reconexión automática maneja caídas temporales del servidor Redis.
 */
import { createClient, type RedisClientType } from 'redis';

/** Instancia única del cliente Redis — inicializada en la primera llamada */
let cliente: RedisClientType | null = null;

/**
 * Retorna la instancia compartida del cliente Redis.
 * Crea la conexión en la primera llamada; la reutiliza en las siguientes.
 *
 * @example
 *   const redis = getRedisClient()
 *   await redis.set('clave', 'valor', { EX: 3600 })
 */
export function getRedisClient(): RedisClientType {
  if (!cliente) {
    cliente = createClient({
      socket: {
        host: process.env['REDIS_HOST'] ?? 'localhost',
        port: Number(process.env['REDIS_PORT'] ?? 6379),
        // Estrategia de reconexión: espera creciente hasta 3 segundos máximo
        reconnectStrategy: (intentos) => Math.min(intentos * 100, 3000)
      },
      // Contraseña opcional — en desarrollo local generalmente no se requiere
      password: process.env['REDIS_PASSWORD'] || undefined
    }) as RedisClientType;

    // Manejo de errores de conexión — no bloquea el proceso pero registra el problema
    cliente.on('error', (err: Error) => {
      console.error('[Redis] Error de conexión:', err.message);
    });

    cliente.on('ready', () => {
      console.info('[Redis] Conectado exitosamente');
    });

    cliente.on('reconnecting', () => {
      console.warn('[Redis] Reconectando...');
    });

    // Iniciar conexión de forma asíncrona — los errores son manejados por el evento 'error'
    cliente.connect().catch((err: Error) => {
      console.error('[Redis] Fallo en la conexión inicial:', err.message);
    });
  }

  return cliente;
}

/**
 * Desconecta Redis de forma segura al apagar la aplicación.
 * Llama a esta función en los manejadores de señales SIGTERM/SIGINT.
 *
 * @example
 *   process.on('SIGTERM', async () => {
 *     await desconectarRedis()
 *     process.exit(0)
 *   })
 */
export async function desconectarRedis(): Promise<void> {
  if (cliente?.isOpen) {
    await cliente.quit();
    cliente = null;
    console.info('[Redis] Desconectado correctamente');
  }
}
