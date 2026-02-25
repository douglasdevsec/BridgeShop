<script setup lang="ts">
/**
 * Home page — BridgeShop storefront
 * Follows vue3-patterns skill: <script setup>, Composition API, TypeScript strict
 */
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Headphones
} from 'lucide-vue-next';

definePageMeta({
  layout: 'default'
});

useSeoMeta({
  title: 'BridgeShop — E-commerce Empresarial',
  description:
    'Compra con confianza en BridgeShop. Catálogo completo, pagos seguros y envíos rápidos.',
  ogTitle: 'BridgeShop',
  ogDescription:
    'Plataforma de e-commerce de alto nivel. Segura, rápida y con soporte IA.',
  ogImage: '/og-home.jpg'
});

useBreadcrumbSchema([{ label: 'Inicio' }]);

// Featured products via SSR
const { data: featuredData } = await useAsyncData('home-featured', () =>
  $fetch('/api/products', { query: { featured: true, limit: 8 } })
);

const features = [
  { icon: ShieldCheck, label: 'Pagos seguros', desc: 'SSL + 3D Secure' },
  { icon: Truck, label: 'Envío rápido', desc: 'Entrega en 24-72h' },
  { icon: RotateCcw, label: 'Devoluciones', desc: '30 días sin costo' },
  { icon: Headphones, label: 'Soporte 24/7', desc: 'Equipo dedicado' }
];
</script>

<template>
  <div class="page-home">
    <!-- Hero Section -->
    <section class="hero bs-animate-in" aria-labelledby="hero-title">
      <div class="bs-container hero__inner">
        <div class="hero__content">
          <span class="hero__eyebrow bs-badge bs-badge-primary"
            >🚀 Plataforma Enterprise</span
          >
          <h1 id="hero-title" class="hero__title">
            E-commerce del<br />
            <span class="hero__accent">futuro, hoy.</span>
          </h1>
          <p class="hero__description">
            Seguridad máxima, rendimiento excepcional e integración nativa con
            agentes de inteligencia artificial vía WebMCP.
          </p>
          <div class="hero__cta">
            <NuxtLink to="/catalog" class="bs-btn bs-btn-primary">
              Ver catálogo <ArrowRight :size="16" />
            </NuxtLink>
            <NuxtLink to="/pages/about" class="bs-btn bs-btn-outline">
              Conocer más
            </NuxtLink>
          </div>
        </div>
        <div class="hero__visual" aria-hidden="true">
          <div class="hero__glow" />
        </div>
      </div>
    </section>

    <!-- Trust Indicators -->
    <section class="features" aria-label="Características">
      <div class="bs-container features__grid">
        <div
          v-for="feature in features"
          :key="feature.label"
          class="feature-card bs-surface"
        >
          <component
            :is="feature.icon"
            :size="24"
            class="feature-card__icon"
            aria-hidden="true"
          />
          <div>
            <strong class="feature-card__label">{{ feature.label }}</strong>
            <p class="feature-card__desc">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="featured-products" aria-labelledby="featured-title">
      <div class="bs-container">
        <header class="section-header">
          <h2 id="featured-title" class="section-header__title">
            Productos Destacados
          </h2>
          <NuxtLink to="/catalog" class="section-header__link">
            Ver todos <ArrowRight :size="14" />
          </NuxtLink>
        </header>

        <div v-if="featuredData?.items?.length" class="products-grid">
          <ProductCard
            v-for="product in featuredData.items"
            :key="product.id"
            :product="product"
            class="bs-animate-in"
          />
        </div>
        <p v-else class="empty-state">
          No hay productos destacados disponibles.
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  padding: 6rem 0 4rem;
  overflow: hidden;
}
.hero__inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}
.hero__eyebrow {
  margin-bottom: 1rem;
  display: inline-flex;
}
.hero__title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  line-height: 1.05;
  margin-bottom: 1.25rem;
}
.hero__accent {
  background: linear-gradient(
    135deg,
    var(--bs-primary-light),
    var(--bs-accent)
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.hero__description {
  color: var(--bs-text-muted);
  font-size: 1.1rem;
  margin-bottom: 2rem;
}
.hero__cta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}
.hero__visual {
  position: relative;
  height: 400px;
}
.hero__glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at center,
    rgba(79, 70, 229, 0.25) 0%,
    transparent 70%
  );
  border-radius: var(--bs-radius-xl);
  border: 1px solid rgba(79, 70, 229, 0.15);
  animation: bs-pulse-glow 4s ease-in-out infinite;
}

.features {
  padding: 3rem 0;
}
.features__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
.feature-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
}
.feature-card__icon {
  color: var(--bs-primary-light);
  flex-shrink: 0;
}
.feature-card__label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
}
.feature-card__desc {
  font-size: 0.8rem;
  color: var(--bs-text-muted);
}

.featured-products {
  padding: 4rem 0;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
}
.section-header__title {
  font-size: 1.75rem;
}
.section-header__link {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--bs-primary-light);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  color: var(--bs-text-muted);
  text-align: center;
  padding: 3rem;
}

@media (max-width: 768px) {
  .hero__inner {
    grid-template-columns: 1fr;
  }
  .hero__visual {
    display: none;
  }
  .features__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .features__grid {
    grid-template-columns: 1fr;
  }
}
</style>
