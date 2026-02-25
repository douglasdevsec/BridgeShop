/**
 * mcpAuth.ts
 * RBAC authentication middleware for MCP/Agent endpoints.
 * Covers: Phase 4 AEO — Control de Acceso para Agentes
 *
 * API Keys are stored hashed (SHA-256 + salt) in the database.
 * Roles: agent:read | agent:write | agent:admin
 */
import { createHmac } from 'crypto';
import type { RequestHandler, Request, Response, NextFunction } from 'express';

export type AgentRole = 'agent:read' | 'agent:write' | 'agent:admin';

/** Extended Request with agent info attached after auth */
export interface AgentRequest extends Request {
  agent?: {
    id: string;
    role: AgentRole;
  };
}

/**
 * Hash an API key using HMAC-SHA256 for storage/comparison.
 * Never store raw API keys in the database.
 */
export function hashApiKey(rawKey: string): string {
  const salt = process.env.MCP_API_KEY_SALT ?? 'bridgeshop-mcp-salt-change-me';
  return createHmac('sha256', salt).update(rawKey).digest('hex');
}

/**
 * Middleware: authenticate and authorize MCP agent requests.
 *
 * @param requiredRole Minimum role needed to access the endpoint
 *
 * @example
 *   router.get('/mcp/catalog', authenticateAgent('agent:read'), catalogHandler)
 *   router.post('/mcp/cart',   authenticateAgent('agent:write'), cartHandler)
 */
export function authenticateAgent(requiredRole: AgentRole): RequestHandler {
  return async (req: AgentRequest, res: Response, next: NextFunction) => {
    const rawKey = req.headers['x-bridgeshop-agent-key'] as string | undefined;

    if (!rawKey) {
      res.status(401).json({ success: false, error: 'Agent API key required' });
      return;
    }

    try {
      const keyHash = hashApiKey(rawKey);

      // Lookup the API key in the database (parameterized — safe from injection)
      const { select, eq, and, isNull } = await import('@bridgeshop/postgres-query-builder');
      const record = await select('agent_api_keys', ['id', 'role', 'rate_limit'])
        .where(and(eq('key_hash', keyHash), isNull('revoked_at')))
        .first();

      if (!record) {
        res.status(401).json({ success: false, error: 'Invalid or revoked API key' });
        return;
      }

      // Role hierarchy check: admin > write > read
      const roleHierarchy: AgentRole[] = ['agent:read', 'agent:write', 'agent:admin'];
      const agentLevel = roleHierarchy.indexOf(record.role as AgentRole);
      const requiredLevel = roleHierarchy.indexOf(requiredRole);

      if (agentLevel < requiredLevel) {
        res.status(403).json({
          success: false,
          error: `Insufficient permissions. Required: ${requiredRole}, has: ${record.role}`
        });
        return;
      }

      // Attach agent info to request for downstream handlers
      req.agent = { id: record.id as string, role: record.role as AgentRole };
      next();

    } catch (err) {
      console.error('[MCP Auth] Error:', err);
      res.status(500).json({ success: false, error: 'Authentication service unavailable' });
    }
  };
}

/**
 * Middleware: log every MCP tool call for security audit.
 * Call this AFTER authenticateAgent to have req.agent available.
 */
export const mcpAuditLog: RequestHandler = (req: AgentRequest, _res, next) => {
  const tool = req.path.split('/').pop() ?? 'unknown';
  console.info(JSON.stringify({
    level: 'AUDIT',
    service: 'mcp',
    tool,
    agentId: req.agent?.id,
    role: req.agent?.role,
    ip: req.ip,
    timestamp: new Date().toISOString()
  }));
  next();
};
