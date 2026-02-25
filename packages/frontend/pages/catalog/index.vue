<script setup lang="ts">
/**
 * Catalog page — Product listing with filters, SSR pagination
 */
import { SlidersHorizontal, Grid3X3, List } from 'lucide-vue-next';

definePageMeta({ layout: 'default' });

const catalogStore = useCatalogStore();
const route = useRoute();
const router = useRouter();

// Sync URL params → filters
const category = computed(() => route.query.category as string | undefined);
const search = computed(() => route.query.search as string | undefined);
const page = computed(() => Number(route.query.page) || 1);

// SSR fetch
const { data, pending } = await useAsyncData(
  `catalog-${route.fullPath}`,
  () =>
    $fetch('/api/products', {
      query: {
        category: category.value,
        search: search.value,
        page: page.value,
        limit: 24
      }
    }),
  { watch: [category, search, page] }
);

// SEO
useSeoMeta({
  title: category.value
    ? `${category.value} — Catálogo`
    : 'Catálogo de Productos',
  description:
    'Explora nuestro catálogo completo de productos. Filtros avanzados, precios accesibles y envío seguro.'
});

useBreadcrumbSchema([
  { label: 'Inicio', to: '/' },
  { label: 'Catálogo', to: '/catalog' },
  ...(category.value ? [{ label: category.value }] : [])
]);

// View mode
const viewMode = ref<'grid' | 'list'>('grid');

// Navigate to page
function goToPage(p: number) {
  router.push({ query: { ...route.query, page: p } });
}
</script>

<template>
  <div class="page-catalog bs-animate-in">
    <div class="bs-container">
      <!-- Page header -->
      <header class="catalog-header">
        <h1 class="catalog-header__title">
          {{ category ?? 'Catálogo Completo' }}
        </h1>
        <p v-if="data?.total" class="catalog-header__count">
          {{ data.total }} productos
        </p>
      </header>

      <div class="catalog-layout">
        <!-- Sidebar Filters -->
        <aside class="catalog-sidebar" aria-label="Filtros de catálogo">
          <div class="bs-surface catalog-sidebar__inner">
            <h2 class="filter-section__title">
              <SlidersHorizontal :size="16" aria-hidden="true" />
              Filtros
            </h2>
            <CatalogFilters />
          </div>
        </aside>

        <!-- Product Grid -->
        <main class="catalog-main">
          <!-- View toggle -->
          <div class="catalog-toolbar">
            <CatalogSort />
            <div class="view-toggle" role="group" aria-label="Modo de vista">
              <button
                :class="['view-toggle__btn', { active: viewMode === 'grid' }]"
                aria-label="Vista en cuadrícula"
                @click="viewMode = 'grid'"
              >
                <Grid3X3 :size="16" aria-hidden="true" />
              </button>
              <button
                :class="['view-toggle__btn', { active: viewMode === 'list' }]"
                aria-label="Vista en lista"
                @click="viewMode = 'list'"
              >
                <List :size="16" aria-hidden="true" />
              </button>
            </div>
          </div>

          <!-- Loading skeleton -->
          <div v-if="pending" class="products-grid">
            <ProductCardSkeleton v-for="i in 24" :key="i" />
          </div>

          <!-- Products -->
          <div
            v-else-if="data?.items?.length"
            :class="[
              'products-grid',
              { 'products-grid--list': viewMode === 'list' }
            ]"
          >
            <ProductCard
              v-for="product in data.items"
              :key="product.id"
              :product="product"
              :list-view="viewMode === 'list'"
            />
          </div>

          <!-- Empty state -->
          <div v-else class="empty-catalog">
            <p>No se encontraron productos con los filtros seleccionados.</p>
            <button
              class="bs-btn bs-btn-outline"
              @click="catalogStore.resetFilters()"
            >
              Limpiar filtros
            </button>
          </div>

          <!-- Pagination -->
          <Pagination
            v-if="data && data.totalPages > 1"
            :current-page="page"
            :total-pages="data.totalPages"
            @change="goToPage"
          />
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-catalog {
  padding: 2rem 0 4rem;
}
.catalog-header {
  margin-bottom: 2rem;
}
.catalog-header__title {
  font-size: 2rem;
}
.catalog-header__count {
  color: var(--bs-text-muted);
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.catalog-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 2rem;
  align-items: start;
}

.catalog-sidebar {
  position: sticky;
  top: 80px;
}
.catalog-sidebar__inner {
  padding: 1.5rem;
}

.filter-section__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.catalog-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.view-toggle {
  display: flex;
  gap: 0.25rem;
}
.view-toggle__btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--bs-radius-sm);
  border: 1px solid var(--bs-border);
  background: transparent;
  color: var(--bs-text-muted);
  cursor: pointer;
  transition: all var(--bs-transition);
}
.view-toggle__btn.active,
.view-toggle__btn:hover {
  background: var(--bs-surface-2);
  color: var(--bs-primary-light);
  border-color: var(--bs-primary);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
}
.products-grid--list {
  grid-template-columns: 1fr;
}

.empty-catalog {
  text-align: center;
  padding: 4rem 0;
  color: var(--bs-text-muted);
}
.empty-catalog p {
  margin-bottom: 1.5rem;
}

@media (max-width: 900px) {
  .catalog-layout {
    grid-template-columns: 1fr;
  }
  .catalog-sidebar {
    position: static;
  }
}
</style>
