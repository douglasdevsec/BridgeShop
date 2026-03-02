/**
 * envSchema.ts
 *
 * Validación estricta de variables de entorno al arrancar el servidor.
 * Cobertura: OWASP A05 — Mala Configuración de Seguridad
 *
 * Si alguna variable crítica está ausente o no coincide con el tipo esperado,
 * el servidor falla rápido con un mensaje descriptivo antes de aceptar
 * cualquier solicitud. Esto previene inicios en estado parcialmente configurado
 * que pueden crear vulnerabilidades silenciosas.
 *
 * Uso: llamar a `validarEnvVars()` en el punto de entrada principal del servidor.
 *
 * Fase 5.7.7 — Seguridad BridgeShop
 */
import { z } from 'zod';

// ── Schema de validación de variables de entorno ─────────────────────────────
const envSchema = z.object({
  // Entorno de ejecución
  NODE_ENV: z.enum(['development', 'production', 'test'], {
    errorMap: () => ({ message: 'NODE_ENV debe ser development, production o test' })
  }),

  // Base de datos PostgreSQL
  DB_HOST: z.string().min(1, 'DB_HOST es requerida'),
  DB_PORT: z
    .string()
    .regex(/^\d+$/, 'DB_PORT debe ser un número')
    .optional()
    .default('5432'),
  DB_NAME: z.string().min(1, 'DB_NAME es requerida'),
  DB_USER: z.string().min(1, 'DB_USER es requerida'),
  DB_PASSWORD: z.string().min(1, 'DB_PASSWORD es requerida'),

  // Seguridad de sesiones y JWT
  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET debe tener al menos 32 caracteres'),
  APP_SECRET: z
    .string()
    .min(32, 'APP_SECRET (CSRF/JWT) debe tener al menos 32 caracteres')
    .optional(),

  // Email (opcional en desarrollo)
  SENDGRID_API_KEY: z
    .string()
    .startsWith('SG.', 'SENDGRID_API_KEY debe comenzar con SG.')
    .optional()
});

// Tipo derivado del schema para uso en TypeScript
export type EnvVars = z.infer<typeof envSchema>;

/**
 * Valida las variables de entorno de proceso contra el schema Zod.
 * Llama a `process.exit(1)` si hay errores de validación,
 * mostrando un mensaje descriptivo de cada variable faltante o incorrecta.
 *
 * @returns Las variables de entorno validadas y tipadas
 */
export function validarEnvVars(): EnvVars {
  const resultado = envSchema.safeParse(process.env);

  if (!resultado.success) {
    const errores = resultado.error.issues
      .map((issue) => `  ✗ ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    console.error(
      `\n🚨 BridgeShop — Error de configuración de entorno:\n${errores}\n` +
        `\nRevisa tu archivo .env y asegúrate de que todas las variables requeridas estén definidas.\n` +
        `Consulta .env.example para ver los valores esperados.\n`
    );

    process.exit(1);
  }

  return resultado.data;
}
