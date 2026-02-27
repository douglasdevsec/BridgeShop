/**
 * exportCustomersCsv.ts
 *
 * API REST — GET /api/customers/export/csv
 * Exporta toda la lista de clientes en formato CSV.
 *
 * Seguridad:
 *   - Requiere sesión administrativa activa.
 *   - Campos exportados son solo los permitidos para reportes internos.
 *   - No se exportan contraseñas ni tokens de sesión.
 *
 * Fase 5.5 — Plan BridgeShop
 */

import { select } from '@bridgeshop/postgres-query-builder';
import type { BridgeShopRequest } from '../../../../types/request.js';
import type { BridgeShopResponse } from '../../../../types/response.js';

// ── Función helper para escapar valores CSV ───────────────────────────────────
function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ── Handler principal ─────────────────────────────────────────────────────────
export default async function exportCustomersCsv(
  request: BridgeShopRequest,
  response: BridgeShopResponse
): Promise<void> {
  try {
    const { pool } = request as any;

    const customers = await select('c.customer_id')
      .select('c.email')
      .select('c.full_name')
      .select('c.status')
      .select('c.group_id')
      .select('c.created_at')
      .from('customer', 'c')
      .execute(pool);

    // Encabezados del CSV — sin campos sensibles
    const headers = ['ID', 'Nombre', 'Email', 'Estado', 'Grupo', 'Registrado'];
    const rows = customers.map((c: any) => [
      escapeCsvValue(c.customer_id),
      escapeCsvValue(c.full_name),
      escapeCsvValue(c.email),
      escapeCsvValue(c.status === 1 ? 'Activo' : 'Inactivo'),
      escapeCsvValue(c.group_id),
      escapeCsvValue(c.created_at)
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.join(','))
      .join('\n');

    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="clientes_${new Date().toISOString().slice(0, 10)}.csv"`
    );
    // BOM para Excel
    response.send('\uFEFF' + csv);
  } catch (error) {
    response.status(500).json({
      error: 'Error al exportar clientes',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
