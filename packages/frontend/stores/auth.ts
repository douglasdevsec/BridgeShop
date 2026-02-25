import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, AuthCredentials, RegisterPayload } from '~/types/auth'

export const useAuthStore = defineStore('auth', () => {
  // ── State ──────────────────────────────────────────────
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ── Getters ─────────────────────────────────────────────
  const isAuthenticated = computed(() => !!user.value && !!accessToken.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const fullName = computed(() =>
    user.value ? `${user.value.firstName} ${user.value.lastName}` : ''
  )

  // ── Actions ─────────────────────────────────────────────
  async function login(credentials: AuthCredentials): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await $fetch<{ user: User; accessToken: string }>('/api/auth/login', {
        method: 'POST',
        body: credentials
      })
      user.value = data.user
      accessToken.value = data.accessToken
      return true
    } catch (err: any) {
      error.value = err?.data?.message ?? 'Credenciales incorrectas'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function register(payload: RegisterPayload): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      const { data } = await $fetch<{ user: User; accessToken: string }>('/api/auth/register', {
        method: 'POST',
        body: payload
      })
      user.value = data.user
      accessToken.value = data.accessToken
      return true
    } catch (err: any) {
      error.value = err?.data?.message ?? 'Error al registrarse'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function logout(): Promise<void> {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } finally {
      user.value = null
      accessToken.value = null
      error.value = null
    }
  }

  async function refreshToken(): Promise<boolean> {
    try {
      const { data } = await $fetch<{ accessToken: string }>('/api/auth/refresh', {
        method: 'POST'
      })
      accessToken.value = data.accessToken
      return true
    } catch {
      user.value = null
      accessToken.value = null
      return false
    }
  }

  async function fetchMe(): Promise<void> {
    if (!accessToken.value) return
    try {
      const { data } = await $fetch<{ user: User }>('/api/auth/me', {
        headers: { Authorization: `Bearer ${accessToken.value}` }
      })
      user.value = data.user
    } catch {
      await logout()
    }
  }

  function clearError() { error.value = null }

  return {
    // state
    user, accessToken, isLoading, error,
    // getters
    isAuthenticated, isAdmin, fullName,
    // actions
    login, register, logout, refreshToken, fetchMe, clearError
  }
}, {
  persist: {
    storage: persistedState.sessionStorage,
    paths: ['user', 'accessToken']
  }
})
