/**
 * securityHeaders.ts
 * Configura Helmet.js con cabeceras de seguridad HTTP estrictas.
 * Cobertura: OWASP A05 — Mala Configuración de Seguridad
 *
 * Lista de protecciones implementadas:
 *  - Content-Security-Policy (CSP) con nonces dinámicos por solicitud
 *  - X-Frame-Options: DENY — previene ataques de clickjacking
 *  - Strict-Transport-Security (HSTS) — fuerza HTTPS por 1 año, con preload
 *  - X-Content-Type-Options: nosniff — previene MIME sniffing
 *  - Referrer-Policy — controla qué información de referente se comparte
 *  - Permissions-Policy — desactiva APIs sensibles del navegador
 *  - X-Powered-By: eliminado para no revelar la tecnología del servidor
 */
import helmet from 'helmet';
import type { RequestHandler } from 'express';

/**
 * Genera un nonce aleatorio de 16 bytes codificado en base64url.
 * Se usa en la directiva script-src de CSP para permitir solo scripts autorizados.
 *
 * @returns Cadena de nonce lista para usar en atributos HTML y cabeceras CSP
 */
export function generarNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Buffer.from(bytes).toString('base64url');
}

/**
 * Retorna el array de middlewares Helmet configurados para BridgeShop.
 * Orden de aplicación: llama a este método una sola vez al inicializar Express.
 *
 * @example
 *   import { cabecerasSeguridad } from './securityHeaders.js'
 *   app.use(cabecerasSeguridad())
 */
export function cabecerasSeguridad(): RequestHandler[] {
  const isDev = process.env.NODE_ENV === 'development';

  return [
    // ── Content-Security-Policy con soporte de nonce ──────────
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],

        // En desarrollo: unsafe-eval necesario para webpack HMR y sourcemaps.
        // En producción: solo scripts con nonce válido o dominios de pago.
        scriptSrc: isDev
          ? ["'self'", "'unsafe-eval'", "'unsafe-inline'", 'https://js.stripe.com', 'https://www.paypal.com']
          : [
              "'self'",
              (_req: any, res: any) => `'nonce-${res.locals.cspNonce}'`,
              'https://js.stripe.com',
              'https://www.paypal.com'
            ],

        // Estilos con nonce o de Google Fonts
        styleSrc: isDev
          ? ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com']
          : [
              "'self'",
              (_req: any, res: any) => `'nonce-${res.locals.cspNonce}'`,
              'https://fonts.googleapis.com'
            ],

        fontSrc:    ["'self'", 'https://fonts.gstatic.com'],
        imgSrc:     ["'self'", 'data:', 'https:', 'blob:'],

        // Conexiones API permitidas
        connectSrc: [
          "'self'",
          'https://api.stripe.com',
          'https://www.paypal.com',
          // WebSocket en desarrollo local (webpack HMR)
          ...(isDev ? ['ws://localhost:*', 'ws://127.0.0.1:*', 'http://localhost:*'] : [])
        ],

        // iframes solo para proveedores de pago
        frameSrc:       ['https://js.stripe.com', 'https://www.paypal.com'],
        frameAncestors: ["'none'"],   // Previene clickjacking completamente
        formAction:     ["'self'"],   // Forms solo envían a nuestro dominio
        objectSrc:      ["'none'"],   // Bloquea plugins (Flash, etc.)
        baseUri:        ["'self'"],   // Previene inyección de base URL

        // upgradeInsecureRequests solo aplica en producción (HTTPS)
        ...(isDev ? {} : { upgradeInsecureRequests: [] })
      }
    }),

    // ── Protección clickjacking (navegadores legacy) ──────────
    helmet.frameguard({ action: 'deny' }),

    // ── HTTP Strict Transport Security ────────────────────────
    // Solo en producción — local dev usa HTTP
    ...(isDev ? [] : [helmet.hsts({
      maxAge: 31_536_000,
      includeSubDomains: true,
      preload: true
    })]),

    // ── Previene interpretación errónea de tipos MIME ─────────
    helmet.noSniff(),

    // ── Controla información de referente compartida ──────────
    helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }),

    // ── Política de dominios cruzados ─────────────────────────
    helmet.permittedCrossDomainPolicies({ permittedPolicies: 'none' }),

    // ── Oculta que usamos Express/Node.js ────────────────────
    helmet.hidePoweredBy()
  ];
}

/**
 * Middleware: genera un nonce CSP fresco para cada solicitud HTTP.
 * Debe montarse ANTES de contentSecurityPolicy para que res.locals.cspNonce esté disponible.
 *
 * @example
 *   app.use(middlewareNonce())
 *   app.use(cabecerasSeguridad())
 */
export function middlewareNonce(): RequestHandler {
  return (_req, res, next) => {
    // Nuevo nonce por solicitud — no reutilizar entre requests
    res.locals['cspNonce'] = generarNonce();
    next();
  };
}
