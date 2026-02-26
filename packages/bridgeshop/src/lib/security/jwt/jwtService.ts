/**
 * jwtService.ts
 * Gestión de tokens JWT de acceso y actualización (refresh) con rotación automática.
 * Cobertura: OWASP A07 — Fallos de Identificación y Autenticación
 *
 * Flujo de autenticación:
 *  1. Login → genera accessToken (15min) + refreshToken (7d, en cookie HttpOnly)
 *  2. Token de acceso expirado → POST /api/auth/refresh → rota ambos tokens
 *  3. Logout → agrega el refreshToken a la lista negra en Redis (TTL = vida restante)
 *
 * Seguridad del almacenamiento:
 *  - accessToken: memoria del cliente (no localStorage — vulnerable a XSS)
 *  - refreshToken: cookie HttpOnly + SameSite Strict + Secure + path restringido
 */
import jwt from 'jsonwebtoken';
import { getRedisClient } from '../redis/redisClient.js';

// ── Tipos ─────────────────────────────────────────────────────

/** Carga útil (payload) incluida en cada token JWT */
export interface PayloadToken {
  sub: string;      // ID del usuario
  email: string;    // Email del usuario
  role: string;     // Rol: 'admin' | 'customer' | 'agent:read' | etc.
  iat?: number;     // Timestamp de emisión (generado por jwt.sign)
  exp?: number;     // Timestamp de expiración (generado por jwt.sign)
}

/** Par de tokens generado en login o refresh */
export interface ParTokens {
  accessToken: string;
  refreshToken: string;
}

// ── Constantes de configuración ───────────────────────────────
const SECRETO_ACCESO  = process.env['JWT_ACCESS_SECRET']!;
const SECRETO_REFRESH = process.env['JWT_REFRESH_SECRET']!;
const TTL_ACCESO      = process.env['JWT_ACCESS_EXPIRES_IN']  ?? '15m';
const TTL_REFRESH     = process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d';

/** Prefijo de clave Redis para tokens en lista negra */
const PREFIJO_BLACKLIST = 'bridgeshop:jwt:blacklist:';

// ── Generación de tokens ──────────────────────────────────────

/**
 * Genera un nuevo par de tokens para un usuario autenticado.
 * Llama a esta función en el login y en cada refresh exitoso.
 *
 * @param payload - Datos del usuario a incluir en el token
 * @returns Par {accessToken, refreshToken}
 */
export function generarParTokens(payload: PayloadToken): ParTokens {
  const base = { sub: payload.sub, email: payload.email, role: payload.role };

  const accessToken = jwt.sign(base, SECRETO_ACCESO, {
    expiresIn: TTL_ACCESO as any,
    algorithm: 'HS256'
  });

  const refreshToken = jwt.sign(base, SECRETO_REFRESH, {
    expiresIn: TTL_REFRESH as any,
    algorithm: 'HS256'
  });

  return { accessToken, refreshToken };
}

// ── Verificación de tokens ────────────────────────────────────

/**
 * Verifica y decodifica un token de acceso.
 * @throws jwt.JsonWebTokenError si el token es inválido
 * @throws jwt.TokenExpiredError si el token ha expirado
 */
export function verificarAccessToken(token: string): PayloadToken {
  return jwt.verify(token, SECRETO_ACCESO) as PayloadToken;
}

/**
 * Verifica y decodifica un refresh token.
 * Además consulta la lista negra en Redis para rechazar tokens revocados.
 *
 * @throws Error si el token está en la lista negra
 * @throws jwt.JsonWebTokenError | jwt.TokenExpiredError si el token es inválido
 */
export async function verificarRefreshToken(token: string): Promise<PayloadToken> {
  const payload = jwt.verify(token, SECRETO_REFRESH) as PayloadToken;

  // Verificar contra la lista negra de Redis
  const redis = getRedisClient();
  const estaEnListaNegra = await redis.get(`${PREFIJO_BLACKLIST}${token}`);

  if (estaEnListaNegra) {
    throw new Error('Token revocado — sesión inválida');
  }

  return payload;
}

// ── Revocación de tokens ──────────────────────────────────────

/**
 * Agrega un refresh token a la lista negra en Redis.
 * Se llama en logout o cuando se detecta una posible vulneración.
 *
 * El TTL de Redis coincide con la vida útil restante del token para
 * limpiar automáticamente las entradas expiradas.
 */
export async function revocarRefreshToken(token: string): Promise<void> {
  try {
    const payload = jwt.decode(token) as PayloadToken | null;
    if (!payload?.exp) return;

    // Calcular tiempo de vida restante del token
    const ttlRestante = payload.exp - Math.floor(Date.now() / 1000);
    if (ttlRestante <= 0) return; // Token ya expirado — no necesita revocación

    const redis = getRedisClient();
    await redis.set(`${PREFIJO_BLACKLIST}${token}`, '1', { EX: ttlRestante });

  } catch {
    // Ignorar errores de decodificación — tokens inválidos ya son ineficaces
  }
}

// ── Opciones de cookie para refresh token ────────────────────

/**
 * Opciones de cookie para el refresh token.
 * Máxima seguridad: HttpOnly, SameSite Strict, Secure, path restringido.
 *
 * - path '/api/auth': la cookie SOLO se envía a rutas de autenticación
 * - httpOnly: inaccesible desde JavaScript — protege contra XSS
 * - sameSite 'strict': no se envía en solicitudes de origen cruzado — protege contra CSRF
 */
export function opcionesCookieRefresh() {
  const esProduccion = process.env['NODE_ENV'] === 'production';
  return {
    httpOnly: true,
    sameSite: esProduccion ? ('strict' as const) : ('lax' as const),
    secure: esProduccion,
    path: '/api/auth',              // Alcance mínimo — solo rutas de autenticación
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días en milisegundos
  };
}
