/**
 * exportCustomersCsv.ts
 *
 * API REST — GET /api/customers/export/csv
 * Exporta la lista de clientes en formato CSV (sin datos sensibles).
 *
 * NOTA DE FIX: Se usa pool.query con SQL crudo en lugar del query builder
 * porque @bridgeshop/postgres-query-builder no soporta aliases de tabla.
 *
 * Fase 5.5 — Plan BridgeShop
 */

// ── Helper: escapar valores CSV ─────────────────────────────────────────────
function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ── Handler ─────────────────────────────────────────────────────────────────
export default async function exportCustomersCsv(
  request: any,
  response: any
): Promise<void> {
  try {
    const pool = request.pool;
    if (!pool) {
      throw new Error('Pool de base de datos no disponible en el request');
    }

    // Solo se exportan campos no sensibles: sin contraseñas ni tokens
    const result = await pool.query(`
      SELECT
        customer_id,
        full_name,
        email,
        status,
        group_id,
        created_at
      FROM customer
      ORDER BY created_at DESC
    `);

    const headers = ['ID', 'Nombre', 'Email', 'Estado', 'Grupo', 'Registrado'];
    const rows = result.rows.map((c: any) => [
      escapeCsvValue(c.customer_id),
      escapeCsvValue(c.full_name),
      escapeCsvValue(c.email),
      escapeCsvValue(c.status === 1 ? 'Activo' : 'Inactivo'),
      escapeCsvValue(c.group_id),
      escapeCsvValue(c.created_at)
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

    // BOM para compatibilidad con Excel
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="clientes_${new Date().toISOString().slice(0, 10)}.csv"`
    );
    response.send('\uFEFF' + csv);
  } catch (error) {
    response.status(500).json({
      error: 'Error al exportar clientes',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
