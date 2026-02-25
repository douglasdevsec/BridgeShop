// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  // TypeScript strict mode
  typescript: {
    strict: true,
    typeCheck: false // run separately with vue-tsc
  },

  // Modules
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    '@vueuse/nuxt',
    'nuxt-security',
    'nuxt-schema-org',
    '@nuxt/image',
    '@nuxt/devtools'
  ],

  // CSS
  css: ['~/assets/css/main.css'],

  // Pinia persistence
  pinia: {
    storesDirs: ['./stores/**']
  },

  // i18n
  i18n: {
    defaultLocale: 'es',
    locales: [
      { code: 'es', name: 'Español', file: 'es.json' },
      { code: 'en', name: 'English', file: 'en.json' }
    ],
    langDir: 'locales/'
  },

  // Nuxt Security (Phase 3 aligned)
  security: {
    headers: {
      contentSecurityPolicy: {
        'default-src': ["'self'"],
        'script-src': ["'self'", "'nonce-{{nonce}}'"],
        'style-src': ["'self'", "'nonce-{{nonce}}'"],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
        'connect-src': ["'self'"],
        'frame-ancestors': ["'none'"],
        'form-action': ["'self'"]
      },
      xFrameOptions: 'DENY',
      xContentTypeOptions: 'nosniff',
      referrerPolicy: 'strict-origin-when-cross-origin',
      permissionsPolicy: {
        camera: [],
        microphone: [],
        geolocation: []
      }
    },
    csrf: {
      enabled: true,
      cookieKey: '__Host-bridgeshop.csrf-token',
      cookieOptions: {
        sameSite: 'strict',
        secure: true,
        httpOnly: true
      }
    }
  },

  // Sitemap
  sitemap: {
    sitemaps: true,
    sources: ['/api/_sitemap/urls']
  },

  // Robots
  robots: {
    groups: [
      {
        userAgent: ['*'],
        disallow: ['/admin', '/api', '/mcp', '/account'],
        allow: ['/']
      },
      {
        // Block AI scrapers from entire site data
        userAgent: ['GPTBot', 'ClaudeBot', 'Google-Extended', 'CCBot'],
        disallow: ['/']
      }
    ]
  },

  // Image optimization
  image: {
    quality: 85,
    formats: ['webp', 'avif'],
    screens: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536
    }
  },

  // Runtime config (public = client-visible, private = server only)
  runtimeConfig: {
    // Private — server only
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    sessionSecret: process.env.SESSION_SECRET,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    sendgridApiKey: process.env.SENDGRID_API_KEY,
    redisHost: process.env.REDIS_HOST || 'localhost',
    redisPort: process.env.REDIS_PORT || '6379',
    redisPassword: process.env.REDIS_PASSWORD || '',
    // Public — exposed to client
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000',
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY || '',
      paypalClientId: process.env.PAYPAL_CLIENT_ID || '',
      appName: 'BridgeShop'
    }
  },

  // SSR
  ssr: true,

  // Nitro server
  nitro: {
    compressPublicAssets: true
  },

  // Vite
  vite: {
    optimizeDeps: {
      include: ['vue', 'pinia', '@vueuse/core']
    }
  }
})
