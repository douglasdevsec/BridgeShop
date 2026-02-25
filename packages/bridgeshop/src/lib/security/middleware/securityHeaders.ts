/**
 * securityHeaders.ts
 * Configures Helmet.js with strict security headers
 * Covers: OWASP A05 – Security Misconfiguration
 * Applied per vulnerability-scanner skill checklist
 */
import helmet from 'helmet';
import type { RequestHandler } from 'express';

/**
 * Generates a random nonce for use with CSP script-src directives.
 * The nonce is attached to res.locals and must be passed to the frontend template.
 */
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString('base64url');
}

/**
 * Returns the Helmet middleware factory configured for BridgeShop.
 * Call this once during Express app initialization.
 */
export function securityHeaders(): RequestHandler[] {
  return [
    // Content-Security-Policy with nonce support
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          // nonce dynamically injected via res.locals.cspNonce
          (_req, res) => `'nonce-${(res as any).locals.cspNonce}'`,
          'https://js.stripe.com',
          'https://www.paypal.com'
        ],
        styleSrc: [
          "'self'",
          (_req, res) => `'nonce-${(res as any).locals.cspNonce}'`,
          'https://fonts.googleapis.com'
        ],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: [
          "'self'",
          'https://api.stripe.com',
          'https://www.paypal.com',
          process.env.NODE_ENV === 'development' ? 'ws://localhost:*' : ''
        ].filter(Boolean) as string[],
        frameSrc: ['https://js.stripe.com', 'https://www.paypal.com'],
        frameAncestors: ["'none'"],        // Clickjacking defense
        formAction: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        upgradeInsecureRequests: []
      }
    }),

    // X-Frame-Options (legacy browsers)
    helmet.frameguard({ action: 'deny' }),

    // HTTP Strict Transport Security
    helmet.hsts({
      maxAge: 31_536_000, // 1 year
      includeSubDomains: true,
      preload: true
    }),

    // Prevent MIME-type sniffing
    helmet.noSniff(),

    // Referrer Policy
    helmet.referrerPolicy({ policy: 'strict-origin-when-cross-origin' }),

    // Permissions Policy
    helmet.permittedCrossDomainPolicies({ permittedPolicies: 'none' }),

    // Remove X-Powered-By
    helmet.hidePoweredBy(),

    // XSS Protection (legacy)
    helmet.xssFilter()
  ];
}

/**
 * Middleware: generate a fresh CSP nonce per request and attach to res.locals
 */
export function cspNonceMiddleware(): RequestHandler {
  return (_req, res, next) => {
    res.locals.cspNonce = generateNonce();
    next();
  };
}
