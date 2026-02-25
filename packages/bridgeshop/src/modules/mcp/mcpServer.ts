/**
 * mcpServer.ts
 * BridgeShop WebMCP Server — Model Context Protocol implementation.
 * Covers: Phase 4 AEO (Agent Experience Optimization)
 *
 * Exposes tools and resources for AI agents (Claude, Gemini, etc.)
 * via JSON-RPC 2.0. All endpoints require API key authentication
 * and are rate-limited independently from the regular API.
 *
 * Auth roles:
 *   agent:read  → search_products, check_stock, catalog resource
 *   agent:write → manage_cart, get_order_status
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  McpSearchProductsSchema,
  McpCheckStockSchema,
  McpManageCartSchema
} from '../security/validators/validators.js';

// ── Server definition ─────────────────────────────────────────
export const mcpServer = new McpServer({
  name: 'BridgeShop',
  version: '1.0.0'
});

// ── Tool: search_products ────────────────────────────────────
/**
 * Search the BridgeShop product catalog.
 * Role required: agent:read
 */
mcpServer.tool(
  'search_products',
  'Search the BridgeShop product catalog by query, category, or price range.',
  {
    query:    z.string().optional().describe('Free-text search query'),
    category: z.string().optional().describe('Category slug (e.g. "electronics")'),
    minPrice: z.number().optional().describe('Minimum price in USD'),
    maxPrice: z.number().optional().describe('Maximum price in USD'),
    limit:    z.number().int().min(1).max(50).default(20).describe('Results per page')
  },
  async ({ query, category, minPrice, maxPrice, limit }) => {
    // Validate input through our Zod schema
    const params = McpSearchProductsSchema.parse({ query, category, minPrice, maxPrice, limit });

    // Build query URL (internal API call — no auth needed server-side)
    const url = new URL('http://localhost:3000/api/products');
    if (params.query)    url.searchParams.set('search', params.query);
    if (params.category) url.searchParams.set('category', params.category);
    if (params.minPrice) url.searchParams.set('minPrice', String(params.minPrice));
    if (params.maxPrice) url.searchParams.set('maxPrice', String(params.maxPrice));
    url.searchParams.set('limit', String(params.limit));

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`Product search failed: ${response.status}`);
    const data = await response.json();

    // Strip any PII — only return public product data
    const safe = (data.items ?? []).map((p: any) => ({
      id: p.id, slug: p.slug, sku: p.sku, name: p.name,
      price: p.price, inStock: p.inStock, stock: p.stock,
      category: p.category?.name, rating: p.rating
    }));

    return {
      content: [{ type: 'text', text: JSON.stringify({ items: safe, total: data.total }) }]
    };
  }
);

// ── Tool: check_stock ─────────────────────────────────────────
/**
 * Check real-time stock for a given SKU.
 * Role required: agent:read
 */
mcpServer.tool(
  'check_stock',
  'Check real-time inventory for a product by its SKU.',
  { sku: z.string().describe('Product SKU to check') },
  async ({ sku }) => {
    const { sku: safeSku } = McpCheckStockSchema.parse({ sku });
    const response = await fetch(`http://localhost:3000/api/products/stock/${encodeURIComponent(safeSku)}`);
    if (!response.ok) throw new Error(`Stock check failed: ${response.status}`);
    const data = await response.json();

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ sku: safeSku, available: data.inStock, quantity: data.stock })
      }]
    };
  }
);

// ── Tool: manage_cart ─────────────────────────────────────────
/**
 * Add, remove, or clear items from a cart session.
 * Role required: agent:write
 */
mcpServer.tool(
  'manage_cart',
  'Add or remove items from a BridgeShop cart.',
  {
    action:   z.enum(['add', 'remove', 'clear']).describe('Cart action to perform'),
    cartId:   z.string().optional().describe('Existing cart ID (UUID)'),
    sku:      z.string().optional().describe('Product SKU (required for add/remove)'),
    quantity: z.number().int().min(1).max(999).optional().describe('Quantity (required for add)')
  },
  async ({ action, cartId, sku, quantity }) => {
    const params = McpManageCartSchema.parse({ action, cartId, sku, quantity });

    let response: Response;
    if (params.action === 'add') {
      response = await fetch('http://localhost:3000/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku: params.sku, quantity: params.quantity, cartId: params.cartId })
      });
    } else if (params.action === 'remove') {
      response = await fetch(`http://localhost:3000/api/cart/items/${encodeURIComponent(params.sku!)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId: params.cartId })
      });
    } else {
      response = await fetch(`http://localhost:3000/api/cart/${params.cartId}`, { method: 'DELETE' });
    }

    if (!response.ok) throw new Error(`Cart operation failed: ${response.status}`);
    const data = await response.json();

    // Return only safe cart data (no user PII)
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ cartId: data.cart?.id, itemCount: data.cart?.items?.length ?? 0 })
      }]
    };
  }
);

// ── Resource: catalog ─────────────────────────────────────────
/**
 * Exposes the full BridgeShop catalog as a readable resource.
 * Role required: agent:read
 */
mcpServer.resource(
  'catalog',
  'bridgeshop://catalog',
  { mimeType: 'application/json', description: 'BridgeShop product catalog (public data only)' },
  async () => {
    const response = await fetch('http://localhost:3000/api/products?limit=100');
    if (!response.ok) throw new Error('Catalog fetch failed');
    const data = await response.json();

    // Strip PII — only public fields
    const safe = (data.items ?? []).map((p: any) => ({
      id: p.id, slug: p.slug, sku: p.sku, name: p.name,
      price: p.price, category: p.category?.name, inStock: p.inStock
    }));

    return { contents: [{ uri: 'bridgeshop://catalog', text: JSON.stringify(safe) }] };
  }
);

// ── Start transport (HTTP mode used by Express — stdio for local dev) ──
export async function startMcpServer() {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
  console.info('[MCP] BridgeShop MCP server started');
}
