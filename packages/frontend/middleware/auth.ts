/**
 * auth.ts middleware — Protects routes requiring authentication
 * Follows vue3-patterns skill: Nuxt middleware pattern
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // Try to restore session from stored token
  if (!authStore.isAuthenticated) {
    const refreshed = await authStore.refreshToken()
    if (!refreshed) {
      return navigateTo(`/account/login?redirect=${encodeURIComponent(to.fullPath)}`)
    }
  }
})
