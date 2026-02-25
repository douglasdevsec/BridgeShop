/**
 * useProducts — Composable for product data fetching with SSR support
 * Uses vue3-patterns skill: Composition API + useAsyncData
 */
import type { Product, ProductFilters, PaginatedProducts } from '~/types'

export function useProducts() {
  const catalogStore = useCatalogStore()

  async function getProducts(filters?: Partial<ProductFilters>) {
    return useAsyncData(
      `products-${JSON.stringify(filters)}`,
      () => $fetch<PaginatedProducts>('/api/products', { query: filters }),
      { default: () => ({ items: [], total: 0, page: 1, perPage: 24, totalPages: 0 }) }
    )
  }

  async function getProduct(slugOrId: string) {
    return useAsyncData(
      `product-${slugOrId}`,
      () => $fetch<{ product: Product }>(`/api/products/${slugOrId}`),
      { transform: (res) => res.product }
    )
  }

  async function searchProducts(query: string) {
    return useAsyncData(
      `search-${query}`,
      () => $fetch<PaginatedProducts>('/api/products/search', { query: { q: query } }),
      { default: () => ({ items: [], total: 0, page: 1, perPage: 24, totalPages: 0 }) }
    )
  }

  return { getProducts, getProduct, searchProducts }
}
