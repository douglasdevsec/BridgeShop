/**
 * mcpAuth.ts
 * Middleware de autenticación RBAC para endpoints MCP/Agente.
 * Contexto de seguridad: Fase 4 AEO — Control de Acceso para Agentes IA
 *
 * Las API Keys se almacenan hasheadas (HMAC-SHA256 + salt) en la base de datos.
 * Roles disponibles: agent:read | agent:write | agent:admin
 *
 * Jerarquía de roles: agent:admin > agent:write > agent:read
 */
import { createHmac } from 'node:crypto';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { Pool } from 'pg';

// ── Tipos exportados ───────────────────────────────────────────

/** Roles disponibles para agentes IA */
export type AgentRole = 'agent:read' | 'agent:write' | 'agent:admin';

/**
 * Request extendida con información del agente autenticado.
 * Disponible en las rutas después de pasar authenticateAgent().
 */
export interface AgentRequest extends Request {
  agent?: {
    id: string;
    role: AgentRole;
  };
}

// ── Pool de conexión DB (reutiliza la instancia del proceso) ───
let _pool: Pool | null = null;

/** Obtiene el pool de PostgreSQL compartido para consultas de autenticación */
function getPool(): Pool {
  if (!_pool) {
    _pool = new Pool({
      host:     process.env['DB_HOST']     ?? 'localhost',
      port:     Number(process.env['DB_PORT'] ?? 5432),
      user:     process.env['DB_USER']     ?? 'postgres',
      password: process.env['DB_PASSWORD'] ?? '',
      database: process.env['DB_NAME']     ?? 'bridgeshop',
      max: 5  // pool pequeño, solo para auth de agentes
    });
  }
  return _pool;
}

// ── Funciones de hashing ───────────────────────────────────────

/**
 * Hashea una API Key cruda usando HMAC-SHA256 con salt configurable.
 * NUNCA almacenes API keys en texto plano en la base de datos.
 *
 * @param rawKey - API Key recibida del cliente
 * @returns Hash hexadecimal de 64 caracteres
 */
export function hashApiKey(rawKey: string): string {
  // Lee el salt del entorno — asegúrate de configurarlo en producción
  const salt = process.env['MCP_API_KEY_SALT'] ?? 'bridgeshop-mcp-salt-change-me';
  return createHmac('sha256', salt).update(rawKey).digest('hex');
}

// ── Middleware de autenticación ────────────────────────────────

/**
 * Middleware: autentica y autoriza solicitudes de agentes MCP.
 *
 * Verifica el header X-BridgeShop-Agent-Key contra la base de datos.
 * Implementa jerarquía de roles para control de acceso granular.
 *
 * @param requiredRole - Rol mínimo requerido para acceder al endpoint
 *
 * @example
 *   router.get('/mcp/catalog', authenticateAgent('agent:read'),  catalogHandler)
 *   router.post('/mcp/cart',   authenticateAgent('agent:write'), cartHandler)
 */
export function authenticateAgent(requiredRole: AgentRole): RequestHandler {
  return async (req: AgentRequest, res: Response, next: NextFunction): Promise<void> => {

    // Leer API Key del header de la solicitud
    const rawKey = req.headers['x-bridgeshop-agent-key'] as string | undefined;

    if (!rawKey) {
      res.status(401).json({ success: false, error: 'API Key de agente requerida' });
      return;
    }

    try {
      const keyHash = hashApiKey(rawKey);
      const pool = getPool();

      // Consulta parametrizada — segura contra inyección SQL (OWASP A03)
      const result = await pool.query<{ id: string; role: string }>(
        `SELECT id, role
           FROM agent_api_keys
          WHERE key_hash   = $1
            AND revoked_at IS NULL
          LIMIT 1`,
        [keyHash]
      );

      // API Key no encontrada o ya revocada
      if (result.rowCount === 0) {
        res.status(401).json({ success: false, error: 'API Key inválida o revocada' });
        return;
      }

      const record = result.rows[0]!;

      // Verificación de jerarquía de roles
      const jerarquia: AgentRole[] = ['agent:read', 'agent:write', 'agent:admin'];
      const nivelAgente   = jerarquia.indexOf(record.role as AgentRole);
      const nivelRequerido = jerarquia.indexOf(requiredRole);

      if (nivelAgente < nivelRequerido) {
        res.status(403).json({
          success: false,
          error: `Permisos insuficientes. Requerido: ${requiredRole}, tiene: ${record.role}`
        });
        return;
      }

      // Adjuntar información del agente al request para handlers posteriores
      req.agent = { id: record.id, role: record.role as AgentRole };
      next();

    } catch (err) {
      console.error('[MCP Auth] Error de autenticación:', err);
      res.status(500).json({ success: false, error: 'Servicio de autenticación no disponible' });
    }
  };
}

// ── Middleware de auditoría ────────────────────────────────────

/**
 * Middleware: registra cada llamada a herramienta MCP para auditoría de seguridad.
 * Debe llamarse DESPUÉS de authenticateAgent() para tener req.agent disponible.
 *
 * Produce logs JSON estructurados compatibles con sistemas SIEM.
 */
export const mcpAuditLog: RequestHandler = (req: AgentRequest, _res, next) => {
  const herramienta = req.path.split('/').pop() ?? 'desconocida';

  // Log estructurado para análisis de seguridad
  console.info(JSON.stringify({
    nivel:       'AUDITORIA',
    servicio:    'mcp',
    herramienta,
    agenteId:    req.agent?.id,
    rol:         req.agent?.role,
    ip:          req.ip,
    userAgent:   req.headers['user-agent'],
    timestamp:   new Date().toISOString()
  }));

  next();
};
