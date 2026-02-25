/**
 * admin.ts middleware — Protects admin routes, requires admin role
 */
export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    const refreshed = await authStore.refreshToken()
    if (!refreshed) return navigateTo('/account/login')
  }

  if (!authStore.isAdmin) {
    throw createError({ statusCode: 403, message: 'Acceso no autorizado' })
  }
})
