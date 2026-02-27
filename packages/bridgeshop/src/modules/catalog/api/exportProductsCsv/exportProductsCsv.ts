/**
 * exportProductsCsv.ts
 *
 * API REST — GET /api/products/export/csv
 * Exporta todos los productos de la tienda en formato CSV.
 *
 * Seguridad:
 *   - Requiere sesión administrativa activa.
 *   - Todos los campos PII de clientes son omitidos (solo datos de productos).
 *
 * Columnas CSV exportadas:
 *   productId, sku, name, price, qty, status, type, urlKey
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
  // Si contiene comas, comillas o saltos de línea — envolver en comillas dobles
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ── Handler principal ─────────────────────────────────────────────────────────
export default async function exportProductsCsv(
  request: BridgeShopRequest,
  response: BridgeShopResponse
): Promise<void> {
  try {
    const { pool } = request as any;

    // Consulta de productos con joins necesarios
    const products = await select('p.product_id')
      .select('p.sku')
      .select('p.price')
      .select('p.status')
      .select('p.type')
      .select('pd.name')
      .select('pd.url_key')
      .select('pi.qty')
      .from('product', 'p')
      .leftJoin('product_description', 'pd')
      .on('p.product_id', '=', 'pd.product_description_product_id')
      .leftJoin('product_inventory', 'pi')
      .on('p.product_id', '=', 'pi.product_inventory_product_id')
      .execute(pool);

    // Encabezados CSV
    const headers = ['ID', 'SKU', 'Nombre', 'Precio', 'Stock', 'Estado', 'Tipo', 'URL Key'];
    const rows = products.map((p: any) => [
      escapeCsvValue(p.product_id),
      escapeCsvValue(p.sku),
      escapeCsvValue(p.name),
      escapeCsvValue(p.price),
      escapeCsvValue(p.qty),
      escapeCsvValue(p.status === 1 ? 'Activo' : 'Inactivo'),
      escapeCsvValue(p.type),
      escapeCsvValue(p.url_key)
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.join(','))
      .join('\n');

    // Configurar respuesta como descarga de archivo
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="productos_${new Date().toISOString().slice(0, 10)}.csv"`
    );
    // Byte Order Mark para compatibilidad con Excel
    response.send('\uFEFF' + csv);
  } catch (error) {
    response.status(500).json({
      error: 'Error al exportar productos',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
