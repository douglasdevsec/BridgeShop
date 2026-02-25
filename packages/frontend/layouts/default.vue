<script setup lang="ts">
import { useCartStore } from '~/stores/cart';
import { useAuthStore } from '~/stores/auth';
import { useUiStore } from '~/stores/ui';
import { ShoppingCart, User, Menu, X, Search } from 'lucide-vue-next';

const cartStore = useCartStore();
const authStore = useAuthStore();
const uiStore = useUiStore();
const route = useRoute();

// Close nav on route change
watch(
  () => route.path,
  () => uiStore.closeNav()
);
</script>

<template>
  <div class="layout-default">
    <!-- Navigation -->
    <header class="bs-navbar" role="banner">
      <nav
        class="bs-container bs-navbar__inner"
        aria-label="Navegación principal"
      >
        <!-- Logo -->
        <NuxtLink
          to="/"
          class="bs-navbar__logo"
          aria-label="BridgeShop — Inicio"
        >
          <span class="bs-logo-text"
            >Bridge<span class="bs-logo-accent">Shop</span></span
          >
        </NuxtLink>

        <!-- Main Nav Links (desktop) -->
        <ul class="bs-navbar__links" role="list">
          <li>
            <NuxtLink to="/catalog" class="bs-nav-link">Catálogo</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/catalog?category=ofertas" class="bs-nav-link"
              >Ofertas</NuxtLink
            >
          </li>
          <li>
            <NuxtLink to="/catalog?inStock=true" class="bs-nav-link"
              >Novedades</NuxtLink
            >
          </li>
        </ul>

        <!-- Actions -->
        <div class="bs-navbar__actions">
          <!-- Search trigger -->
          <button class="bs-icon-btn" aria-label="Buscar productos">
            <Search :size="20" />
          </button>

          <!-- Auth -->
          <NuxtLink
            v-if="!authStore.isAuthenticated"
            to="/account/login"
            class="bs-icon-btn"
            aria-label="Iniciar sesión"
          >
            <User :size="20" />
          </NuxtLink>
          <NuxtLink
            v-else
            to="/account"
            class="bs-icon-btn"
            aria-label="Mi cuenta"
          >
            <User :size="20" />
          </NuxtLink>

          <!-- Cart -->
          <button
            class="bs-icon-btn bs-cart-btn"
            :aria-label="`Carrito (${cartStore.itemCount} artículos)`"
            @click="cartStore.toggleCart()"
          >
            <ShoppingCart :size="20" />
            <span v-if="cartStore.itemCount > 0" class="bs-cart-badge">
              {{ cartStore.itemCount > 99 ? '99+' : cartStore.itemCount }}
            </span>
          </button>

          <!-- Mobile menu toggle -->
          <button
            class="bs-icon-btn bs-mobile-menu-btn"
            :aria-label="uiStore.isNavOpen ? 'Cerrar menú' : 'Abrir menú'"
            :aria-expanded="uiStore.isNavOpen"
            @click="uiStore.toggleNav()"
          >
            <X v-if="uiStore.isNavOpen" :size="20" />
            <Menu v-else :size="20" />
          </button>
        </div>
      </nav>

      <!-- Mobile nav -->
      <Transition name="slide-down">
        <div v-if="uiStore.isNavOpen" class="bs-mobile-nav" role="navigation">
          <ul role="list">
            <li>
              <NuxtLink to="/catalog" @click="uiStore.closeNav()"
                >Catálogo</NuxtLink
              >
            </li>
            <li>
              <NuxtLink
                to="/catalog?category=ofertas"
                @click="uiStore.closeNav()"
                >Ofertas</NuxtLink
              >
            </li>
            <li v-if="!authStore.isAuthenticated">
              <NuxtLink to="/account/login" @click="uiStore.closeNav()"
                >Iniciar sesión</NuxtLink
              >
            </li>
            <li v-else>
              <NuxtLink to="/account" @click="uiStore.closeNav()"
                >Mi cuenta</NuxtLink
              >
            </li>
          </ul>
        </div>
      </Transition>
    </header>

    <!-- Main content -->
    <main id="main-content" class="bs-main" role="main">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bs-footer" role="contentinfo">
      <div class="bs-container bs-footer__inner">
        <div class="bs-footer__brand">
          <span class="bs-logo-text"
            >Bridge<span class="bs-logo-accent">Shop</span></span
          >
          <p>
            © {{ new Date().getFullYear() }} BridgeShop. Creado por
            <strong>Douglas Puente</strong>.
          </p>
        </div>
        <nav class="bs-footer__links" aria-label="Footer">
          <NuxtLink to="/catalog">Catálogo</NuxtLink>
          <NuxtLink to="/pages/about">Nosotros</NuxtLink>
          <NuxtLink to="/pages/contact">Contacto</NuxtLink>
          <NuxtLink to="/pages/privacy">Privacidad</NuxtLink>
        </nav>
      </div>
    </footer>

    <!-- Cart Drawer (teleported) -->
    <CartDrawer />
  </div>
</template>

<style scoped>
.layout-default {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.bs-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(15, 15, 26, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--bs-border);
}

.bs-navbar__inner {
  display: flex;
  align-items: center;
  gap: 2rem;
  height: 64px;
}

.bs-navbar__logo {
  flex-shrink: 0;
}

.bs-logo-text {
  font-family: var(--bs-font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--bs-text-strong);
}
.bs-logo-accent {
  color: var(--bs-primary-light);
}

.bs-navbar__links {
  display: flex;
  gap: 1.5rem;
  list-style: none;
  flex: 1;
}

.bs-nav-link {
  color: var(--bs-text-muted);
  font-size: 0.9rem;
  font-weight: 500;
  transition: color var(--bs-transition);
}
.bs-nav-link:hover,
.bs-nav-link.router-link-active {
  color: var(--bs-text-strong);
}

.bs-navbar__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.bs-icon-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--bs-radius-sm);
  border: none;
  background: transparent;
  color: var(--bs-text-muted);
  cursor: pointer;
  transition:
    background var(--bs-transition),
    color var(--bs-transition);
}
.bs-icon-btn:hover {
  background: var(--bs-surface-2);
  color: var(--bs-text-strong);
}

.bs-cart-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: var(--bs-primary);
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  border-radius: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bs-mobile-menu-btn {
  display: none;
}

.bs-mobile-nav {
  border-top: 1px solid var(--bs-border);
  padding: 1rem 1.5rem;
}
.bs-mobile-nav ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.bs-mobile-nav a {
  color: var(--bs-text-muted);
  font-weight: 500;
}

.bs-main {
  flex: 1;
}

.bs-footer {
  background: var(--bs-surface);
  border-top: 1px solid var(--bs-border);
  padding: 2rem 0;
}
.bs-footer__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
}
.bs-footer__brand p {
  font-size: 0.8rem;
  color: var(--bs-text-muted);
  margin-top: 0.25rem;
}
.bs-footer__links {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.bs-footer__links a {
  font-size: 0.85rem;
  color: var(--bs-text-muted);
}
.bs-footer__links a:hover {
  color: var(--bs-primary-light);
}

/* Mobile */
@media (max-width: 768px) {
  .bs-navbar__links {
    display: none;
  }
  .bs-mobile-menu-btn {
    display: flex;
  }
  .bs-footer__inner {
    flex-direction: column;
    text-align: center;
  }
}

/* Transitions */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
