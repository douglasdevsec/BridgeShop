/**
 * env.d.ts
 * Declaraciones de tipos para variables de entorno de BridgeShop.
 * Garantiza que process.env tenga autocompletado y verificación de tipos en TypeScript.
 *
 * Referencia: .env.example en la raíz del proyecto.
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // ── Entorno de aplicación ──────────────────────────────────
      NODE_ENV:       'development' | 'production' | 'test';
      PORT?:          string;
      APP_URL?:       string;

      // ── Secretos de aplicación ────────────────────────────────
      APP_SECRET:     string;
      SESSION_SECRET: string;

      // ── Base de datos PostgreSQL ──────────────────────────────
      DB_HOST?:       string;
      DB_PORT?:       string;
      DB_USER?:       string;
      DB_PASSWORD?:   string;
      DB_NAME?:       string;
      DB_SSL?:        string;

      // ── Redis ─────────────────────────────────────────────────
      REDIS_HOST?:    string;
      REDIS_PORT?:    string;
      REDIS_PASSWORD?:string;

      // ── JWT — Autenticación con tokens ───────────────────────
      JWT_ACCESS_SECRET:          string;
      JWT_REFRESH_SECRET:         string;
      JWT_ACCESS_EXPIRES_IN?:     string;   // ej: '15m'
      JWT_REFRESH_EXPIRES_IN?:    string;   // ej: '7d'

      // ── Pagos ─────────────────────────────────────────────────
      STRIPE_SECRET_KEY?:         string;
      STRIPE_PUBLIC_KEY?:         string;
      STRIPE_WEBHOOK_SECRET?:     string;
      PAYPAL_CLIENT_ID?:          string;
      PAYPAL_CLIENT_SECRET?:      string;

      // ── Email ─────────────────────────────────────────────────
      SENDGRID_API_KEY?:          string;
      EMAIL_FROM?:                string;

      // ── MCP — Agentes IA ──────────────────────────────────────
      MCP_API_KEY_SALT:           string;
      MCP_ENABLED?:               string;

      // ── Almacenamiento ────────────────────────────────────────
      STORAGE_DRIVER?:            'local' | 's3';
      AWS_ACCESS_KEY_ID?:         string;
      AWS_SECRET_ACCESS_KEY?:     string;
      AWS_S3_BUCKET?:             string;
      AWS_REGION?:                string;

      // ── Rate limiting ─────────────────────────────────────────
      RATE_LIMIT_WINDOW_MS?:      string;
      RATE_LIMIT_AUTH_MAX?:       string;
      RATE_LIMIT_CHECKOUT_MAX?:   string;
    }
  }
}

// Necesario para que el archivo sea tratado como módulo TypeScript
export {};
