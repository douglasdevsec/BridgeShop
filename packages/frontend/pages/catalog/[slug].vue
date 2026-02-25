<script setup lang="ts">
/**
 * [slug].vue — Product detail page with JSON-LD structured data
 */
import { ShoppingCart, Heart, Share2, Star } from 'lucide-vue-next';

definePageMeta({ layout: 'default' });

const route = useRoute();
const cartStore = useCartStore();

// SSR product fetch
const { data: product, error } = await useAsyncData(
  `product-${route.params.slug}`,
  () => $fetch(`/api/products/${route.params.slug}`).then((r: any) => r.product)
);

// 404 if not found
if (!product.value) {
  throw createError({ statusCode: 404, message: 'Producto no encontrado' });
}

// SEO
useSeoMeta({
  title: product.value.name,
  description:
    product.value.shortDescription ?? product.value.description.slice(0, 160),
  ogTitle: `${product.value.name} — BridgeShop`,
  ogImage: product.value.images[0]?.url,
  ogType: 'og:product'
});

// JSON-LD structured data
useProductSchema(product.value);
useBreadcrumbSchema([
  { label: 'Inicio', to: '/' },
  { label: 'Catálogo', to: '/catalog' },
  {
    label: product.value.category.name,
    to: `/catalog?category=${product.value.category.slug}`
  },
  { label: product.value.name }
]);

// State
const selectedVariantId = ref<string | null>(
  product.value.variants[0]?.id ?? null
);
const quantity = ref(1);
const isAdding = ref(false);

const selectedVariant = computed(
  () =>
    product.value!.variants.find((v) => v.id === selectedVariantId.value) ??
    null
);

const currentPrice = computed(
  () => selectedVariant.value?.price ?? product.value!.price
);

const currentStock = computed(
  () => selectedVariant.value?.stock ?? product.value!.stock
);

async function addToCart() {
  if (!product.value) return;
  isAdding.value = true;
  const sku = selectedVariant.value?.sku ?? product.value.sku;
  await cartStore.addItem(sku, quantity.value);
  cartStore.openCart();
  isAdding.value = false;
}
</script>

<template>
  <article v-if="product" class="page-product bs-animate-in">
    <div class="bs-container">
      <div class="product-layout">
        <!-- Gallery -->
        <section class="product-gallery" aria-label="Imágenes del producto">
          <ProductGallery :images="product.images" :alt="product.name" />
        </section>

        <!-- Info -->
        <section class="product-info" aria-label="Información del producto">
          <!-- Category & Name -->
          <NuxtLink
            :to="`/catalog?category=${product.category.slug}`"
            class="product-info__category"
          >
            {{ product.category.name }}
          </NuxtLink>
          <h1 class="product-info__name">{{ product.name }}</h1>

          <!-- Rating -->
          <div
            v-if="product.reviewCount > 0"
            class="product-info__rating"
            aria-label="Valoración"
          >
            <span class="stars" aria-hidden="true">
              <Star
                v-for="i in 5"
                :key="i"
                :size="14"
                :fill="
                  i <= Math.round(product.rating) ? 'currentColor' : 'none'
                "
              />
            </span>
            <span>{{ product.rating.toFixed(1) }}</span>
            <span class="rating-count"
              >({{ product.reviewCount }} reseñas)</span
            >
          </div>

          <!-- Price -->
          <div class="product-info__price">
            <span class="price-current">${{ currentPrice.toFixed(2) }}</span>
            <span
              v-if="
                product.compareAtPrice && product.compareAtPrice > currentPrice
              "
              class="price-compare"
            >
              ${{ product.compareAtPrice.toFixed(2) }}
            </span>
            <span v-if="!product.inStock" class="bs-badge bs-badge-danger"
              >Agotado</span
            >
          </div>

          <!-- Variants -->
          <div
            v-if="product.variants.length > 1"
            class="product-info__variants"
          >
            <label class="variant-label">Variante</label>
            <div
              class="variant-options"
              role="radiogroup"
              :aria-label="`Seleccionar variante de ${product.name}`"
            >
              <button
                v-for="variant in product.variants"
                :key="variant.id"
                :class="[
                  'variant-btn',
                  { selected: selectedVariantId === variant.id }
                ]"
                :aria-pressed="selectedVariantId === variant.id"
                :disabled="variant.stock === 0"
                @click="selectedVariantId = variant.id"
              >
                {{ variant.name }}
              </button>
            </div>
          </div>

          <!-- Quantity + Add to Cart -->
          <div class="product-info__actions">
            <div class="quantity-control" role="group" aria-label="Cantidad">
              <button
                class="qty-btn"
                :disabled="quantity <= 1"
                aria-label="Disminuir"
                @click="quantity--"
              >
                −
              </button>
              <span class="qty-display" aria-live="polite">{{ quantity }}</span>
              <button
                class="qty-btn"
                :disabled="quantity >= currentStock"
                aria-label="Aumentar"
                @click="quantity++"
              >
                +
              </button>
            </div>
            <button
              class="bs-btn bs-btn-primary add-to-cart-btn"
              :disabled="!product.inStock || isAdding"
              :aria-busy="isAdding"
              @click="addToCart"
            >
              <ShoppingCart :size="18" aria-hidden="true" />
              {{ isAdding ? 'Agregando…' : 'Agregar al carrito' }}
            </button>
            <button class="bs-icon-btn" aria-label="Agregar a favoritos">
              <Heart :size="20" />
            </button>
            <button class="bs-icon-btn" aria-label="Compartir producto">
              <Share2 :size="20" />
            </button>
          </div>

          <!-- Description -->
          <div class="product-info__description">
            <p>{{ product.shortDescription ?? product.description }}</p>
          </div>
        </section>
      </div>
    </div>
  </article>
</template>

<style scoped>
.page-product {
  padding: 3rem 0 5rem;
}

.product-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: start;
}

.product-info__category {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--bs-primary-light);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.product-info__name {
  font-size: 2rem;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
}

.product-info__rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  font-size: 0.875rem;
}
.stars {
  display: flex;
  gap: 2px;
  color: var(--bs-accent);
}
.rating-count {
  color: var(--bs-text-muted);
}

.product-info__price {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.price-current {
  font-size: 2rem;
  font-weight: 700;
  color: var(--bs-text-strong);
}
.price-compare {
  font-size: 1.1rem;
  color: var(--bs-text-muted);
  text-decoration: line-through;
}

.variant-label {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: block;
}
.variant-options {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.variant-btn {
  padding: 0.4rem 0.875rem;
  border-radius: var(--bs-radius-sm);
  border: 1px solid var(--bs-border);
  background: transparent;
  color: var(--bs-text-muted);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--bs-transition);
}
.variant-btn.selected {
  border-color: var(--bs-primary);
  color: var(--bs-primary-light);
  background: rgba(79, 70, 229, 0.1);
}
.variant-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.product-info__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin: 1.75rem 0;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.qty-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--bs-radius-sm);
  border: 1px solid var(--bs-border);
  background: var(--bs-surface-2);
  color: var(--bs-text);
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background var(--bs-transition);
}
.qty-btn:hover:not(:disabled) {
  background: var(--bs-surface);
}
.qty-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.qty-display {
  font-size: 1rem;
  font-weight: 600;
  min-width: 2rem;
  text-align: center;
}

.add-to-cart-btn {
  flex: 1;
  min-width: 180px;
}

.product-info__description {
  color: var(--bs-text-muted);
  line-height: 1.7;
  font-size: 0.9rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--bs-border);
}

@media (max-width: 768px) {
  .product-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
}
</style>
