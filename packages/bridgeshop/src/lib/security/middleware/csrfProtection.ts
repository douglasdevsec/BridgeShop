/**
 * csrfProtection.ts
 * Protección Anti-CSRF usando el patrón de cookie de doble envío.
 * Cobertura: OWASP A01 — Control de Acceso Roto
 *
 * Mecanismo de funcionamiento:
 *  1. GET /api/csrf-token → el servidor genera un token, establece una cookie
 *     HttpOnly y devuelve el valor del token en JSON.
 *  2. El cliente envía el header X-CSRF-Token en cada solicitud mutante
 *     (POST, PUT, PATCH, DELETE).
 *  3. El middleware valida que el header coincide con el valor de la cookie.
 *
 * Nota de seguridad: La cookie se configura con SameSite=Strict en producción
 * para prevenir ataques de sitios cruzados.
 */
import { doubleCsrf } from 'csrf-csrf';
import type { RequestHandler } from 'express';

/** Indica si la aplicación está corriendo en entorno de producción */
const esProduccion = process.env['NODE_ENV'] === 'production';

const { generateToken, doubleCsrfProtection } = doubleCsrf({
  /**
   * Secreto para firmar el token CSRF.
   * Debe coincidir con APP_SECRET o usar un secreto dedicado en producción.
   */
  getSecret: () => process.env['APP_SECRET'] ?? 'bridgeshop-csrf-secret-cambiar-en-produccion',

  /**
   * Configuración de la cookie:
   * - HttpOnly: no accesible por JavaScript del cliente
   * - SameSite Strict: previene envío en solicitudes de sitios cruzados
   * - Secure: solo se envía por HTTPS en producción
   * - __Host- prefix: garantiza que la cookie es de dominio raíz exacto
   */
  cookieName: '__Host-bs.csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: esProduccion ? 'strict' : 'lax',
    secure: esProduccion,
    path: '/'
  },

  /** Tamaño del token: 64 bytes = 512 bits de entropía */
  size: 64,

  /**
   * Estrategia de lectura del token:
   * 1. Header X-CSRF-Token (préferible — XHR / fetch)
   * 2. Campo oculto _csrf en el cuerpo del formulario (HTML forms)
   */
  getTokenFromRequest: (req) =>
    (req.headers['x-csrf-token'] as string) ??
    (req.body?._csrf as string)
});

/**
 * Middleware de validación CSRF.
 * Aplícalo a todas las rutas POST, PUT, PATCH y DELETE.
 *
 * @example
 *   app.use('/api', csrfProtection)
 */
export const csrfProtection: RequestHandler = doubleCsrfProtection;

/**
 * Manejador de ruta: devuelve un token CSRF fresco al cliente.
 * Monta en: GET /api/csrf-token
 *
 * El frontend Vue/Nuxt llama a este endpoint una vez al iniciar la aplicación
 * y almacena el token para incluirlo en las solicitudes mutantes posteriores.
 *
 * @example
 *   router.get('/csrf-token', getCsrfToken)
 */
export const getCsrfToken: RequestHandler = (req, res) => {
  const token = generateToken(req, res);
  res.json({ csrfToken: token });
};
