/**
 * Additional security headers & small hardening tweaks.
 */
export function securityHeaders() {
  return function (_req, res, next) {
    // Minimal CSP (adjust when adding external assets)
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; connect-src 'self' ws: wss: http: https:; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'"
    );
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  };
}
