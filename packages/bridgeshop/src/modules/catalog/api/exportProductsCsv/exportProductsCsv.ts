/**
 * exportProductsCsv.ts
 *
 * API REST — GET /api/products/export/csv
 * Exporta todos los productos de la tienda en formato CSV.
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
export default async function exportProductsCsv(
  request: any,
  response: any
): Promise<void> {
  try {
    // El pool de PostgreSQL se inyecta en el request por el middleware del framework
    const pool = request.pool;
    if (!pool) {
      throw new Error('Pool de base de datos no disponible en el request');
    }

    const result = await pool.query(`
      SELECT
        product.product_id,
        product.sku,
        product.price,
        product.status,
        product.type,
        product_description.name,
        product_description.url_key,
        product_inventory.qty
      FROM product
      LEFT JOIN product_description
        ON product.product_id = product_description.product_description_product_id
      LEFT JOIN product_inventory
        ON product.product_id = product_inventory.product_inventory_product_id
      ORDER BY product.product_id ASC
    `);

    // Construcción del CSV
    const headers = ['ID', 'SKU', 'Nombre', 'Precio', 'Stock', 'Estado', 'Tipo', 'URL Key'];
    const rows = result.rows.map((p: any) => [
      escapeCsvValue(p.product_id),
      escapeCsvValue(p.sku),
      escapeCsvValue(p.name),
      escapeCsvValue(p.price),
      escapeCsvValue(p.qty),
      escapeCsvValue(p.status === 1 ? 'Activo' : 'Inactivo'),
      escapeCsvValue(p.type),
      escapeCsvValue(p.url_key)
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

    // BOM para compatibilidad con Excel
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="productos_${new Date().toISOString().slice(0, 10)}.csv"`
    );
    response.send('\uFEFF' + csv);
  } catch (error) {
    response.status(500).json({
      error: 'Error al exportar productos',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
