import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product, Category, ProductFilters, PaginatedProducts } from '~/types/catalog'

export const useCatalogStore = defineStore('catalog', () => {
  // ── State ──────────────────────────────────────────────
  const products = ref<Product[]>([])
  const categories = ref<Category[]>([])
  const currentProduct = ref<Product | null>(null)
  const filters = ref<ProductFilters>({
    search: '',
    category: null,
    minPrice: null,
    maxPrice: null,
    sortBy: 'newest',
    inStock: false
  })
  const pagination = ref({ page: 1, perPage: 24, total: 0, totalPages: 0 })
  const isLoading = ref(false)

  // ── Getters ─────────────────────────────────────────────
  const hasProducts = computed(() => products.value.length > 0)
  const totalProducts = computed(() => pagination.value.total)
  const hasNextPage = computed(() => pagination.value.page < pagination.value.totalPages)
  const hasPrevPage = computed(() => pagination.value.page > 1)

  // ── Actions ─────────────────────────────────────────────
  async function fetchProducts(overrideFilters?: Partial<ProductFilters>): Promise<void> {
    isLoading.value = true
    const activeFilters = { ...filters.value, ...overrideFilters }
    try {
      const data = await $fetch<PaginatedProducts>('/api/products', {
        query: {
          ...activeFilters,
          page: pagination.value.page,
          limit: pagination.value.perPage
        }
      })
      products.value = data.items
      pagination.value.total = data.total
      pagination.value.totalPages = data.totalPages
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProduct(slugOrId: string): Promise<Product | null> {
    isLoading.value = true
    try {
      const { data } = await $fetch<{ product: Product }>(`/api/products/${slugOrId}`)
      currentProduct.value = data.product
      return data.product
    } catch {
      currentProduct.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCategories(): Promise<void> {
    const { data } = await $fetch<{ categories: Category[] }>('/api/categories')
    categories.value = data.categories
  }

  function setFilter<K extends keyof ProductFilters>(key: K, value: ProductFilters[K]): void {
    filters.value[key] = value
    pagination.value.page = 1 // reset to page 1 on filter change
  }

  function setPage(page: number): void {
    pagination.value.page = page
  }

  function resetFilters(): void {
    filters.value = {
      search: '',
      category: null,
      minPrice: null,
      maxPrice: null,
      sortBy: 'newest',
      inStock: false
    }
    pagination.value.page = 1
  }

  return {
    // state
    products, categories, currentProduct, filters, pagination, isLoading,
    // getters
    hasProducts, totalProducts, hasNextPage, hasPrevPage,
    // actions
    fetchProducts, fetchProduct, fetchCategories, setFilter, setPage, resetFilters
  }
})
