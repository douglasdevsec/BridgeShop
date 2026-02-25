/**
 * rateLimiter.ts
 * Rate limiting and brute-force protection for BridgeShop endpoints
 * Covers: OWASP A07 – Identification and Authentication Failures
 */
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import type { RequestHandler } from 'express';

// ── Config constants ──────────────────────────────────────────────────────────
const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000; // 1 minute

/**
 * Generic rate limiter factory
 */
function createLimiter(options: {
  max: number;
  windowMs?: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}): RequestHandler {
  return rateLimit({
    windowMs: options.windowMs ?? WINDOW_MS,
    max: options.max,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests ?? false,
    message: {
      success: false,
      error: options.message ?? 'Demasiadas solicitudes. Intenta de nuevo más tarde.',
      retryAfter: Math.ceil((options.windowMs ?? WINDOW_MS) / 1000)
    },
    keyGenerator: (req) => {
      // Use IP + User-Agent fingerprint
      const ip = (req.headers['cf-connecting-ip'] as string)
        ?? req.headers['x-forwarded-for']?.toString().split(',')[0].trim()
        ?? req.ip
        ?? 'unknown';
      return ip;
    }
  });
}

// ── Specific limiters ─────────────────────────────────────────────────────────

/**
 * Auth limiter: 5 attempts per minute per IP
 * Applied to: POST /api/auth/login, POST /api/auth/register
 */
export const authRateLimiter: RequestHandler = createLimiter({
  max: Number(process.env.RATE_LIMIT_AUTH_MAX) || 5,
  windowMs: 60_000,
  message: 'Demasiados intentos de autenticación. Espera 1 minuto.',
  skipSuccessfulRequests: true
});

/**
 * Slow-down: adds 500ms delay per request after the 3rd failed attempt
 * Applied to auth endpoints to deter brute force
 */
export const authSlowDown: RequestHandler = slowDown({
  windowMs: 60_000,
  delayAfter: 3,
  delayMs: (used) => (used - 3) * 500, // exponential-like backoff
  maxDelayMs: 5000
});

/**
 * Checkout limiter: 10 requests per minute
 * Applied to: /api/checkout/*
 */
export const checkoutRateLimiter: RequestHandler = createLimiter({
  max: Number(process.env.RATE_LIMIT_CHECKOUT_MAX) || 10,
  windowMs: 60_000,
  message: 'Límite de solicitudes de checkout alcanzado. Intenta de nuevo en 1 minuto.'
});

/**
 * Password reset limiter: 3 requests per 10 minutes
 */
export const passwordResetRateLimiter: RequestHandler = createLimiter({
  max: 3,
  windowMs: 600_000, // 10 minutes
  message: 'Demasiadas solicitudes de recuperación de contraseña.'
});

/**
 * MCP / Agent limiter: 60 requests per minute per API Key
 */
export const mcpRateLimiter: RequestHandler = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Limit by agent API Key, not IP
    return (req.headers['x-bridgeshop-agent-key'] as string) ?? req.ip ?? 'unknown';
  },
  message: { success: false, error: 'Límite de API MCP alcanzado.' }
});

/**
 * Global API limiter: 120 requests per minute (catch-all)
 */
export const globalRateLimiter: RequestHandler = createLimiter({
  max: 120,
  windowMs: 60_000,
  message: 'Límite global de solicitudes alcanzado.'
});
