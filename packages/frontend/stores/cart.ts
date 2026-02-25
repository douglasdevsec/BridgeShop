import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem, Cart, AppliedCoupon } from '~/types/cart'

export const useCartStore = defineStore('cart', () => {
  // ── State ──────────────────────────────────────────────
  const items = ref<CartItem[]>([])
  const isOpen = ref(false)
  const isLoading = ref(false)
  const coupon = ref<AppliedCoupon | null>(null)
  const cartId = ref<string | null>(null)

  // ── Getters (computed) ──────────────────────────────────
  const itemCount = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const subtotal = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  const discount = computed(() => {
    if (!coupon.value) return 0
    if (coupon.value.type === 'percentage') {
      return subtotal.value * (coupon.value.value / 100)
    }
    return Math.min(coupon.value.value, subtotal.value)
  })

  const total = computed(() => Math.max(0, subtotal.value - discount.value))

  const isEmpty = computed(() => items.value.length === 0)

  // ── Actions ─────────────────────────────────────────────
  async function addItem(sku: string, quantity = 1): Promise<void> {
    isLoading.value = true
    try {
      const { data } = await $fetch<{ cart: Cart }>('/api/cart/items', {
        method: 'POST',
        body: { sku, quantity, cartId: cartId.value }
      })
      syncFromServer(data.cart)
    } finally {
      isLoading.value = false
    }
  }

  async function removeItem(sku: string): Promise<void> {
    isLoading.value = true
    try {
      const { data } = await $fetch<{ cart: Cart }>(`/api/cart/items/${sku}`, {
        method: 'DELETE',
        body: { cartId: cartId.value }
      })
      syncFromServer(data.cart)
    } finally {
      isLoading.value = false
    }
  }

  async function updateQuantity(sku: string, quantity: number): Promise<void> {
    if (quantity <= 0) return removeItem(sku)
    isLoading.value = true
    try {
      const { data } = await $fetch<{ cart: Cart }>(`/api/cart/items/${sku}`, {
        method: 'PATCH',
        body: { quantity, cartId: cartId.value }
      })
      syncFromServer(data.cart)
    } finally {
      isLoading.value = false
    }
  }

  async function applyCoupon(code: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data } = await $fetch<{ cart: Cart; message: string }>('/api/cart/coupon', {
        method: 'POST',
        body: { code, cartId: cartId.value }
      })
      syncFromServer(data.cart)
      return { success: true, message: data.message }
    } catch (err: any) {
      return { success: false, message: err?.data?.message ?? 'Cupón inválido' }
    }
  }

  async function clearCart(): Promise<void> {
    items.value = []
    coupon.value = null
    cartId.value = null
  }

  function syncFromServer(cart: Cart): void {
    items.value = cart.items
    coupon.value = cart.coupon ?? null
    cartId.value = cart.id
  }

  function openCart() { isOpen.value = true }
  function closeCart() { isOpen.value = false }
  function toggleCart() { isOpen.value = !isOpen.value }

  return {
    // state
    items, isOpen, isLoading, coupon, cartId,
    // getters
    itemCount, subtotal, discount, total, isEmpty,
    // actions
    addItem, removeItem, updateQuantity, applyCoupon, clearCart,
    openCart, closeCart, toggleCart
  }
}, {
  persist: {
    storage: persistedState.localStorage,
    paths: ['items', 'cartId', 'coupon']
  }
})
