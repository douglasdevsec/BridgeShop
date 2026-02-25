<script setup lang="ts">
import { useSchemaOrg, defineWebSite, defineWebPage } from 'nuxt-schema-org';

// Global schema.org for the site
useSchemaOrg([
  defineWebSite({
    name: 'BridgeShop',
    description:
      'Enterprise e-commerce platform built with Vue 3, Nuxt 3 and Node.js',
    url: useRuntimeConfig().public.appUrl,
    inLanguage: 'es'
  }),
  defineWebPage()
]);

// Global SEO head defaults
useHead({
  titleTemplate: (title) => (title ? `${title} — BridgeShop` : 'BridgeShop'),
  htmlAttrs: { lang: 'es' },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#1a1a2e' },
    { property: 'og:site_name', content: 'BridgeShop' },
    { property: 'og:type', content: 'website' }
  ],
  link: [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap'
    }
  ]
});
</script>

<template>
  <div id="bridgeshop-app">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- Toast notifications -->
    <Toast />
  </div>
</template>
