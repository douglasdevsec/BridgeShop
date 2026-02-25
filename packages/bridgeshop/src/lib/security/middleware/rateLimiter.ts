/**
 * rateLimiter.ts
 * Limitación de tasa de solicitudes y protección contra fuerza bruta.
 * Cobertura: OWASP A07 — Fallos de Identificación y Autenticación
 *
 * Estrategia implementada:
 *  - Identificación por IP real (soporta Cloudflare y proxies)
 *  - Ventanas de tiempo configurables por variable de entorno
 *  - Slow-down progresivo en intentos de autenticación fallidos
 *  - Limitadores diferenciados por endpoint crítico
 */
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import type { RequestHandler } from 'express';

// ── Constantes de configuración ───────────────────────────────
/** Ventana de tiempo predeterminada: 1 minuto en milisegundos */
const VENTANA_MS = Number(process.env['RATE_LIMIT_WINDOW_MS']) || 60_000;

// ── Fábrica interna de limitadores ───────────────────────────

/**
 * Crea un limitador de tasa con configuración específica.
 * Retorna respuestas estándar RFC 6585 con cabecera RateLimit-*.
 */
function crearLimitador(opciones: {
  max: number;
  ventanaMs?: number;
  mensaje?: string;
  omitirExitosas?: boolean;
}): RequestHandler {
  return rateLimit({
    windowMs: opciones.ventanaMs ?? VENTANA_MS,
    max: opciones.max,
    standardHeaders: 'draft-7',  // Cabeceras RateLimit-* estándar
    legacyHeaders: false,         // Desactiva cabeceras X-RateLimit-* deprecadas
    skipSuccessfulRequests: opciones.omitirExitosas ?? false,
    message: {
      success: false,
      error: opciones.mensaje ?? 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
      reintentarEn: Math.ceil((opciones.ventanaMs ?? VENTANA_MS) / 1000)
    },
    // Detecta IP real detrás de proxies/CDN
    keyGenerator: (req) => {
      const ip =
        (req.headers['cf-connecting-ip'] as string) ??          // Cloudflare
        req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ?? // Proxy
        req.ip ??
        'desconocida';
      return ip;
    }
  });
}

// ── Limitadores específicos por endpoint ──────────────────────

/**
 * Limitador de autenticación: 5 intentos por minuto por IP.
 * Aplica solo a intentos fallidos (omite solicitudes exitosas).
 * Monta en: POST /api/auth/login, POST /api/auth/register
 */
export const limitadorAuth: RequestHandler = crearLimitador({
  max: Number(process.env['RATE_LIMIT_AUTH_MAX']) || 5,
  ventanaMs: 60_000,
  mensaje: 'Demasiados intentos de autenticación. Espera 1 minuto.',
  omitirExitosas: true
});

/**
 * Slow-down progresivo: añade 500ms de retraso por cada intento fallido
 * a partir del 3ro, con un máximo de 5 segundos de penalización.
 * Complementa al limitadorAuth para disuadir ataques de fuerza bruta.
 *
 * Monta junto con limitadorAuth en rutas de autenticación.
 */
export const slowDownAuth: RequestHandler = slowDown({
  windowMs: 60_000,
  delayAfter: 3,                           // Empieza a frenar desde el 4to intento
  delayMs: (usados) => (usados - 3) * 500, // Retraso creciente: 500ms, 1s, 1.5s…
  maxDelayMs: 5000                          // Máximo 5 segundos de penalización
});

/**
 * Limitador de checkout: 10 solicitudes por minuto.
 * Previene abusos en el proceso de pago.
 * Monta en: /api/checkout/*
 */
export const limitadorCheckout: RequestHandler = crearLimitador({
  max: Number(process.env['RATE_LIMIT_CHECKOUT_MAX']) || 10,
  ventanaMs: 60_000,
  mensaje: 'Límite de solicitudes de checkout alcanzado. Intenta de nuevo en 1 minuto.'
});

/**
 * Limitador de recuperación de contraseña: 3 intentos por 10 minutos.
 * Ventana ampliada para prevenir enumeración de cuentas.
 * Monta en: POST /api/auth/forgot-password
 */
export const limitadorRecuperacion: RequestHandler = crearLimitador({
  max: 3,
  ventanaMs: 600_000,  // 10 minutos
  mensaje: 'Demasiadas solicitudes de recuperación de contraseña. Espera 10 minutos.'
});

/**
 * Limitador de agentes MCP: 60 solicitudes por minuto por API Key.
 * Identifica por API Key del agente, no por IP (los agentes pueden
 * estar distribuidos en múltiples servidores).
 * Monta en: /api/mcp/*
 */
export const limitadorMcp: RequestHandler = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  // Identification por API Key del agente (no por IP)
  keyGenerator: (req) =>
    (req.headers['x-bridgeshop-agent-key'] as string) ?? req.ip ?? 'desconocida',
  message: { success: false, error: 'Límite de API MCP alcanzado. Espera 1 minuto.' }
});

/**
 * Limitador global de API: 120 solicitudes por minuto (límite general).
 * Se aplica a todas las rutas /api/* como capa de defensa base.
 */
export const limitadorGlobal: RequestHandler = crearLimitador({
  max: 120,
  ventanaMs: 60_000,
  mensaje: 'Límite global de solicitudes de API alcanzado.'
});
