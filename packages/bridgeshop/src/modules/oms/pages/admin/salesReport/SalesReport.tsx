/**
 * SalesReport.tsx
 *
 * Página de Reportes de Ventas — Panel Administrativo (BridgeShop).
 *
 * Muestra:
 *  - Resumen de ventas totales: importe, cantidad de órdenes, ticket promedio.
 *  - Lista de órdenes recientes ordenadas por fecha descendente.
 *  - Botón para exportar el reporte en CSV.
 *
 * Datos: obtenidos directamente del servidor a través de la query GraphQL
 * `salesReport`. Los datos monetarios se muestran pre-formateados por el backend.
 *
 * Fase 5.5 — Plan BridgeShop
 */

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@components/common/ui/Card.js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@components/common/ui/Table.js';
import React from 'react';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface SalesReportItem {
  orderId: number;
  orderNumber: string;
  customer: string;
  total: string;           // Texto formateado: "USD 99.99"
  status: string;
  createdAt: string;       // Texto formateado: "27/02/2025 10:00"
}

interface SalesReportProps {
  salesReport: {
    totalRevenue: string;  // Texto formateado
    totalOrders: number;
    averageOrderValue: string;
    orders: SalesReportItem[];
  };
  exportSalesReportUrl: string;
}

// ── Componente principal ───────────────────────────────────────────────────────

export default function SalesReport({
  salesReport: { totalRevenue, totalOrders, averageOrderValue, orders },
  exportSalesReportUrl
}: SalesReportProps) {
  return (
    <div className="main-content-inner space-y-6">
      {/* Encabezado + botón exportar */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Reportes de Ventas</h1>
        <a
          href={exportSalesReportUrl}
          className="btn btn-outline btn-sm"
          aria-label="Exportar reporte de ventas a CSV"
        >
          ↓ Exportar CSV
        </a>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Ingresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">{totalRevenue}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Total de Órdenes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalOrders}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Ticket Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{averageOrderValue}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de órdenes */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Órdenes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead># Orden</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No hay órdenes registradas.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.total}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'complete'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'canceled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {order.createdAt}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export const layout = {
  areaId: 'content',
  sortOrder: 10
};

// ── Query GraphQL ─────────────────────────────────────────────────────────────

export const query = `
  query SalesReportQuery {
    exportSalesReportUrl: url(routeId: "exportSalesReport")
    salesReport {
      totalRevenue
      totalOrders
      averageOrderValue
      orders {
        orderId
        orderNumber
        customer
        total
        status
        createdAt
      }
    }
  }
`;
