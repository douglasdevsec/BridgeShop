/**
 * validators.ts
 * Zod schemas for all critical BridgeShop API inputs.
 * Covers: OWASP A03 – Injection prevention.
 *
 * Usage example:
 *   import { validateBody } from './validators.js'
 *   import { LoginSchema } from './validators.js'
 *   router.post('/login', validateBody(LoginSchema), loginHandler)
 */
import { z } from 'zod';
import type { RequestHandler } from 'express';

// ── Reusable field definitions ──────────────────────────────────

/** Email: lowercase, trimmed, valid format */
const EmailField = z.string().trim().toLowerCase().email('Email inválido');

/** Password: min 8 chars, at least 1 uppercase + 1 number */
const PasswordField = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número');

/** Slug: lowercase alphanumeric with hyphens */
const SlugField = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido');

/** Integer ID: positive integer */
const IdField = z.coerce.number().int().positive();

/** Pagination */
const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24)
});

// ── Auth Schemas ────────────────────────────────────────────────

export const LoginSchema = z.object({
  email: EmailField,
  password: z.string().min(1, 'Contraseña requerida')
});

export const RegisterSchema = z.object({
  email: EmailField,
  password: PasswordField,
  firstName: z.string().trim().min(1).max(64),
  lastName: z.string().trim().min(1).max(64)
});

export const PasswordResetSchema = z.object({
  email: EmailField
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: PasswordField
});

// ── Product Schemas ─────────────────────────────────────────────

export const ProductSearchSchema = PaginationSchema.extend({
  search: z.string().trim().max(200).optional(),
  category: SlugField.optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortBy: z.enum(['newest', 'oldest', 'price-asc', 'price-desc', 'rating']).default('newest'),
  inStock: z.coerce.boolean().default(false)
});

export const ProductCreateSchema = z.object({
  name: z.string().trim().min(1).max(512),
  slug: SlugField,
  sku: z.string().trim().min(1).max(100),
  description: z.string().trim().max(10_000),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  categoryId: IdField,
  stock: z.number().int().min(0).default(0)
});

// ── Cart Schemas ────────────────────────────────────────────────

export const AddToCartSchema = z.object({
  sku: z.string().trim().min(1).max(100),
  quantity: z.number().int().min(1).max(999),
  cartId: z.string().uuid().optional()
});

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().min(0).max(999)
});

export const ApplyCouponSchema = z.object({
  code: z.string().trim().min(1).max(50),
  cartId: z.string().uuid().optional()
});

// ── Checkout / Address Schemas ──────────────────────────────────

export const AddressSchema = z.object({
  firstName: z.string().trim().min(1).max(64),
  lastName:  z.string().trim().min(1).max(64),
  address1:  z.string().trim().min(1).max(255),
  address2:  z.string().trim().max(255).optional(),
  city:      z.string().trim().min(1).max(100),
  state:     z.string().trim().min(1).max(100),
  zip:       z.string().trim().min(1).max(20),
  country:   z.string().trim().length(2, 'Use ISO 2-letter country code'),
  phone:     z.string().trim().regex(/^\+?[\d\s\-()]{7,20}$/, 'Teléfono inválido')
});

export const CheckoutSchema = z.object({
  cartId:          z.string().uuid(),
  shippingAddress: AddressSchema,
  billingAddress:  AddressSchema.optional(), // defaults to shippingAddress
  paymentMethod:   z.enum(['stripe', 'paypal', 'cod'])
});

// ── MCP Agent Schemas ───────────────────────────────────────────

export const McpSearchProductsSchema = z.object({
  query:     z.string().trim().max(200).optional(),
  category:  SlugField.optional(),
  minPrice:  z.number().min(0).optional(),
  maxPrice:  z.number().min(0).optional(),
  limit:     z.number().int().min(1).max(50).default(20)
});

export const McpCheckStockSchema = z.object({
  sku: z.string().trim().min(1).max(100)
});

export const McpManageCartSchema = z.object({
  action:  z.enum(['add', 'remove', 'clear']),
  cartId:  z.string().uuid().optional(),
  sku:     z.string().trim().min(1).max(100).optional(),
  quantity: z.number().int().min(1).max(999).optional()
});

// ── Middleware factory ──────────────────────────────────────────

/**
 * Generic validation middleware factory.
 * Validates req.body against the provided Zod schema.
 * Returns 422 with structured errors on failure.
 *
 * @example
 *   router.post('/login', validateBody(LoginSchema), loginHandler)
 */
export function validateBody<T extends z.ZodTypeAny>(schema: T): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(422).json({
        success: false,
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors
      });
      return;
    }
    // Replace req.body with the parsed+sanitized data
    req.body = result.data;
    next();
  };
}

/**
 * Validate URL query parameters against a Zod schema.
 *
 * @example
 *   router.get('/products', validateQuery(ProductSearchSchema), listHandler)
 */
export function validateQuery<T extends z.ZodTypeAny>(schema: T): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(422).json({
        success: false,
        error: 'Invalid query parameters',
        details: result.error.flatten().fieldErrors
      });
      return;
    }
    (req as any).validatedQuery = result.data;
    next();
  };
}
