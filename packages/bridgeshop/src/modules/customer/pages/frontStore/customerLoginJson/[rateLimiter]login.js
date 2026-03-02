/**
 * [rateLimiter]login.js
 *
 * Middleware de seguridad para el login del cliente en el FrontStore.
 * Límite duro de 5 intentos/min por IP para prevenir fuerza bruta.
 *
 * Fase 5.7.3 — Seguridad BridgeShop
 */
import { limitadorAuth } from '../../../../../lib/security/middleware/rateLimiter.js';

export default limitadorAuth;

