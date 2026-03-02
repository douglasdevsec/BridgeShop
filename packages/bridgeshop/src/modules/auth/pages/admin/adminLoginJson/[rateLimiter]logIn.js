/**
 * [rateLimiter]logIn.js
 *
 * Middleware de seguridad aplicado ANTES del handler de login del admin.
 * Protege contra:
 *  - Ataques de fuerza bruta (limitadorAuth: 5 intentos/min por IP)
 *  - Enumeración de cuentas (slowDownAuth: retraso progresivo desde el 4to intento)
 *
 * El nombre entre corchetes lo hace ejecutar como middleware previo en el pipeline
 * antes de [bodyParser]logIn.js según la convención del framework.
 *
 * Fase 5.7.3 — Seguridad BridgeShop
 */
import { limitadorAuth, slowDownAuth } from '../../../../../lib/security/middleware/rateLimiter.js';

/**
 * Aplica primero el slow-down progresivo, luego el límite duro de intentos.
 * Si el IP supera 5 intentos/min, la solicitud es rechazada con 429.
 */
export default [slowDownAuth, limitadorAuth];
