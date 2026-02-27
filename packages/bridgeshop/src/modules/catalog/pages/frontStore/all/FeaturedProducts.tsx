/**
 * FeaturedProducts.tsx
 *
 * Componente de la página principal (Home) que muestra dinámicamente los
 * productos más vendidos y activos, sincronizándose en tiempo real con los
 * productos creados o actualizados en el panel administrativo.
 *
 * Datos: obtenidos mediante la query GraphQL `featuredProducts` del backend.
 * Renderizado: usa el componente compartido `ProductList` para consistencia con
 * el catálogo y las búsquedas.
 *
 * Fase 5.1 — Plan BridgeShop
 */

import { _ } from '@bridgeshop/bridgeshop/lib/locale/translate/_';
import { ProductList } from '@components/frontStore/catalog/ProductList.js';
import React from 'react';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface PriceValue {
  value: number;
  text: string;
}

interface FeaturedProductItem {
  productId: number;
  uuid: string;
  name: string;
  sku: string;
  price: {
    regular: PriceValue;
    special?: PriceValue | null;
  };
  inventory: {
    isInStock: boolean;
  };
  image: {
    alt: string;
    url: string;
  } | null;
  url: string;
}

interface FeaturedProductsProps {
  /** Lista de productos más vendidos y visibles retornada por el resolver */
  featuredProducts?: FeaturedProductItem[];
  /** Cantidad máxima de columnas en el grid */
  featuredProductsCount?: number;
}

// ── Componente ────────────────────────────────────────────────────────────────

/**
 * Muestra una sección destacada de productos en la página principal.
 * Si no hay productos activos, el componente se oculta automáticamente
 * (no muestra secciones vacías).
 */
export default function FeaturedProducts({
  featuredProducts = [],
  featuredProductsCount = 4
}: FeaturedProductsProps) {
  // No renderizar la sección si no hay productos publicados
  if (!featuredProducts || featuredProducts.length === 0) {
    return null;
  }

  return (
    <section
      className="featured__products__section py-12"
      aria-labelledby="featured-products-heading"
    >
      <div className="page-width">
        {/* Encabezado de la sección */}
        <div className="featured__products__header text-center mb-8">
          <h2
            id="featured-products-heading"
            className="h3 uppercase tracking-widest"
          >
            {_('Productos Destacados')}
          </h2>
          <p className="text-muted mt-2 text-sm">
            {_('Los productos más populares de nuestra tienda')}
          </p>
        </div>

        {/* Grid de productos — usa ProductList para consistencia visual */}
        <ProductList
          products={featuredProducts as any}
          gridColumns={featuredProductsCount}
          showAddToCart={true}
          layout="grid"
        />

        {/* Botón para ver el catálogo completo */}
        <div className="featured__products__footer flex justify-center mt-8">
          <a
            href="/catalog"
            className="btn btn-outline btn-lg"
            aria-label={_('Ver todos los productos del catálogo')}
          >
            {_('Ver Catálogo Completo')}
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Query GraphQL ─────────────────────────────────────────────────────────────

/**
 * Query para obtener los productos más vendidos y activos.
 * El resolver los ordena por cantidad vendida (cart_item.qty) en forma
 * descendente, garantizando que los más populares aparecen primero.
 */
export const query = `
  query FeaturedProductsQuery($featuredProductsCount: Int) {
    featuredProducts(limit: $featuredProductsCount) {
      productId
      uuid
      name
      sku
      price {
        regular {
          value
          text
        }
        special {
          value
          text
        }
      }
      inventory {
        isInStock
      }
      image {
        alt
        url
      }
      url
    }
  }
`;

/** Variables para la query — `featuredProductsCount` controla cuántos mostrar */
export const variables = `{
  "featuredProductsCount": 8
}`;
