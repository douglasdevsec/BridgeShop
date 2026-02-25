// Cart types
export interface CartItem {
  sku: string
  name: string
  slug: string
  image: string
  price: number
  quantity: number
  variantId?: string
  variantName?: string
  maxStock: number
}

export interface AppliedCoupon {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  description: string
}

export interface Cart {
  id: string
  items: CartItem[]
  coupon?: AppliedCoupon
  subtotal: number
  discount: number
  total: number
}

// ── Auth types ─────────────────────────────────────────────
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'customer' | 'agent:read' | 'agent:write'
  avatar?: string
  createdAt: string
}

export interface AuthCredentials {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  password: string
  firstName: string
  lastName: string
}

// ── Catalog types ──────────────────────────────────────────
export interface ProductImage {
  url: string
  alt: string
  isPrimary: boolean
}

export interface ProductVariant {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  attributes: Record<string, string>
}

export interface Product {
  id: string
  slug: string
  sku: string
  name: string
  description: string
  shortDescription?: string
  price: number
  compareAtPrice?: number
  images: ProductImage[]
  variants: ProductVariant[]
  category: Category
  stock: number
  inStock: boolean
  rating: number
  reviewCount: number
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  slug: string
  name: string
  image?: string
  parentId?: string
  productCount?: number
}

export interface ProductFilters {
  search: string
  category: string | null
  minPrice: number | null
  maxPrice: number | null
  sortBy: 'newest' | 'oldest' | 'price-asc' | 'price-desc' | 'rating'
  inStock: boolean
}

export interface PaginatedProducts {
  items: Product[]
  total: number
  page: number
  perPage: number
  totalPages: number
}

// ── Order types ────────────────────────────────────────────
export interface OrderAddress {
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
}

export interface Order {
  id: string
  number: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: CartItem[]
  shippingAddress: OrderAddress
  billingAddress: OrderAddress
  subtotal: number
  discount: number
  shipping: number
  tax: number
  total: number
  paymentMethod: string
  createdAt: string
}
