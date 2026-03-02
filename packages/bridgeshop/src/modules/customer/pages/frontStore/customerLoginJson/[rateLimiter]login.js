/**
 * [rateLimiter]login.js
 *
 * Middleware de seguridad para el login del cliente en el FrontStore.
 * Aplica slow-down progresivo + límite duro igual que el login de admin.
 *
 * Fase 5.7.3 — Seguridad BridgeShop
 */
import { limitadorAuth, slowDownAuth } from '../../../../../lib/security/middleware/rateLimiter.js';

export default [slowDownAuth, limitadorAuth];
