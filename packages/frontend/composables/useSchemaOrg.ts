/**
 * useSchemaOrg — Composable for injecting JSON-LD structured data
 * Covers: Product, Offer, AggregateRating, BreadcrumbList
 */
import type { Product } from '~/types'

export function useProductSchema(product: Product) {
  useSchemaOrg([{
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription ?? product.description,
    image: product.images.map(img => img.url),
    sku: product.sku,
    brand: { '@type': 'Brand', name: 'BridgeShop' },
    offers: {
      '@type': 'Offer',
      price: product.price.toFixed(2),
      priceCurrency: 'USD',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: useRequestURL().href,
      seller: { '@type': 'Organization', name: 'BridgeShop' }
    },
    ...(product.reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating.toFixed(1),
        reviewCount: product.reviewCount,
        bestRating: '5',
        worstRating: '1'
      }
    })
  }])
}

export function useBreadcrumbSchema(items: Array<{ label: string; to?: string }>) {
  const config = useRuntimeConfig()
  const base = config.public.apiBase

  useSchemaOrg([{
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.label,
      ...(item.to && { item: `${base}${item.to}` })
    }))
  }])
}
