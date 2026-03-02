/**
 * [rateLimiter]logIn.js
 *
 * Middleware de seguridad aplicado ANTES del handler de login del admin.
 * Protege contra ataques de fuerza bruta (limitadorAuth: 5 intentos/min por IP).
 *
 * Fase 5.7.3 — Seguridad BridgeShop
 */
import { limitadorAuth } from '../../../../../lib/security/middleware/rateLimiter.js';

export default limitadorAuth;

