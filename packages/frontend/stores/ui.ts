import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

type Theme = 'dark' | 'light'
type Locale = 'es' | 'en'

export const useUiStore = defineStore('ui', () => {
  // ── State ──────────────────────────────────────────────
  const theme = ref<Theme>('dark')
  const locale = ref<Locale>('es')
  const isNavOpen = ref(false)
  const isAdminSidebarOpen = ref(true)
  const globalLoading = ref(false)
  const breadcrumbs = ref<Array<{ label: string; to?: string }>>([])

  // ── Getters ─────────────────────────────────────────────
  const isDark = computed(() => theme.value === 'dark')

  // ── Actions ─────────────────────────────────────────────
  function setTheme(t: Theme): void { theme.value = t }
  function toggleTheme(): void { theme.value = isDark.value ? 'light' : 'dark' }
  function setLocale(l: Locale): void { locale.value = l }
  function toggleNav(): void { isNavOpen.value = !isNavOpen.value }
  function closeNav(): void { isNavOpen.value = false }
  function toggleAdminSidebar(): void { isAdminSidebarOpen.value = !isAdminSidebarOpen.value }
  function setGlobalLoading(val: boolean): void { globalLoading.value = val }
  function setBreadcrumbs(crumbs: typeof breadcrumbs.value): void { breadcrumbs.value = crumbs }

  return {
    theme, locale, isNavOpen, isAdminSidebarOpen, globalLoading, breadcrumbs,
    isDark,
    setTheme, toggleTheme, setLocale, toggleNav, closeNav,
    toggleAdminSidebar, setGlobalLoading, setBreadcrumbs
  }
}, {
  persist: {
    storage: persistedState.localStorage,
    paths: ['theme', 'locale']
  }
})
