/**
 * jwtService.ts
 * JWT access + refresh token management with rotation and Redis blacklist.
 * Covers: OWASP A07 – Identification and Authentication Failures
 *
 * Flow:
 *  1. Login → issue accessToken (15min) + refreshToken (7d, stored in HttpOnly cookie)
 *  2. Access token expires → POST /api/auth/refresh → rotate both tokens
 *  3. Logout → blacklist the refresh token in Redis (TTL = remaining lifetime)
 */
import jwt from 'jsonwebtoken';
import { getRedisClient } from '../redis/redisClient.js';

// ── Types ─────────────────────────────────────────────────────
export interface TokenPayload {
  sub: string;        // user ID
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ── Constants ─────────────────────────────────────────────────
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_TTL = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';
const REFRESH_TTL = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

// Redis key prefix for blacklisted tokens
const BLACKLIST_PREFIX = 'bridgeshop:jwt:blacklist:';

// ── Token generation ──────────────────────────────────────────

/**
 * Generate a new access + refresh token pair for a user.
 * Call this on login and on every successful token refresh.
 */
export function generateTokenPair(payload: TokenPayload): TokenPair {
  const base = { sub: payload.sub, email: payload.email, role: payload.role };

  const accessToken = jwt.sign(base, ACCESS_SECRET, {
    expiresIn: ACCESS_TTL,
    algorithm: 'HS256'
  });

  const refreshToken = jwt.sign(base, REFRESH_SECRET, {
    expiresIn: REFRESH_TTL,
    algorithm: 'HS256'
  });

  return { accessToken, refreshToken };
}

// ── Token verification ────────────────────────────────────────

/**
 * Verify and decode an access token.
 * @throws jwt.JsonWebTokenError | jwt.TokenExpiredError on invalid input
 */
export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
}

/**
 * Verify and decode a refresh token.
 * Also checks the Redis blacklist to reject revoked tokens.
 */
export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  const payload = jwt.verify(token, REFRESH_SECRET) as TokenPayload;

  // Check blacklist
  const redis = getRedisClient();
  const isBlacklisted = await redis.get(`${BLACKLIST_PREFIX}${token}`);
  if (isBlacklisted) {
    throw new Error('Token revoked');
  }

  return payload;
}

// ── Token revocation ──────────────────────────────────────────

/**
 * Blacklist a refresh token in Redis until its natural expiry.
 * Called on logout or when a compromise is detected.
 */
export async function revokeRefreshToken(token: string): Promise<void> {
  try {
    const payload = jwt.decode(token) as TokenPayload | null;
    if (!payload?.exp) return;

    const ttl = payload.exp - Math.floor(Date.now() / 1000);
    if (ttl <= 0) return; // already expired, no need to blacklist

    const redis = getRedisClient();
    await redis.set(`${BLACKLIST_PREFIX}${token}`, '1', { EX: ttl });
  } catch {
    // Silently ignore decode errors — expired/invalid tokens are already invalid
  }
}

// ── Cookie helpers ────────────────────────────────────────────

/** Returns the cookie options for storing the refresh token securely */
export function refreshCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    sameSite: isProduction ? ('strict' as const) : ('lax' as const),
    secure: isProduction,
    path: '/api/auth',   // Scoped to auth routes only
    maxAge: 7 * 24 * 60 * 60 * 1000  // 7 days in ms
  };
}
