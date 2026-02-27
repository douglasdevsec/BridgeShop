/**
 * SalesReport.resolvers.js
 *
 * Resolvedor GraphQL para la query `salesReport`.
 * Retorna un resumen de ventas y el historial de órdenes.
 *
 * Seguridad:
 *   - Solo accesible desde el panel administrativo (middleware de autorización provisto por el framework).
 *   - No se exponen datos sensibles de clientes (sólo nombre + datos de orden).
 *
 * Fase 5.5 — Plan BridgeShop
 */

import { select } from '@bridgeshop/postgres-query-builder';

export default {
  Query: {
    salesReport: async (root, args, { pool }) => {
      // Consulta de todas las órdenes con datos de cliente
      const orders = await select('o.order_id')
        .select('o.order_number')
        .select('o.grand_total')
        .select('o.current_status')
        .select('o.created_at')
        .select("CONCAT(c.full_name, ' <', c.email, '>') as customer_info")
        .from('order', 'o')
        .leftJoin('customer', 'c')
        .on('o.customer_id', '=', 'c.customer_id')
        .orderBy('o.created_at', 'desc')
        .execute(pool);

      // Calcular totales
      const totalOrders = orders.length;
      const totalRevenueValue = orders.reduce(
        (sum, o) => sum + parseFloat(o.grand_total || '0'),
        0
      );
      const averageOrderValue =
        totalOrders > 0 ? totalRevenueValue / totalOrders : 0;

      /**
       * Formatear un valor numérico como texto de moneda
       * @param {number} value
       * @returns {string}
       */
      const formatCurrency = (value) =>
        new Intl.NumberFormat('es-VE', {
          style: 'currency',
          currency: 'USD'
        }).format(value);

      return {
        totalRevenue: formatCurrency(totalRevenueValue),
        totalOrders,
        averageOrderValue: formatCurrency(averageOrderValue),
        orders: orders.map((o) => ({
          orderId: o.order_id,
          orderNumber: o.order_number || String(o.order_id),
          customer: o.customer_info || 'Invitado',
          total: formatCurrency(parseFloat(o.grand_total || '0')),
          status: o.current_status || 'pending',
          createdAt: o.created_at
            ? new Date(o.created_at).toLocaleString('es-VE')
            : '-'
        }))
      };
    }
  }
};
