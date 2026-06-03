import crypto from 'node:crypto'

// Authorize cron requests via the `Authorization: Bearer <secret>` header ONLY.
// The secret is never read from the URL/query string — secrets in URLs leak into
// access logs, proxies, and browser history. Comparison is constant-time.
export function isCronAuthorized(headers = {}, secret) {
  if (!secret) return false
  const bearer = (headers.authorization || '').replace(/^Bearer\s+/i, '')
  const provided = Buffer.from(bearer)
  const expected = Buffer.from(secret)
  return provided.length === expected.length && crypto.timingSafeEqual(provided, expected)
}
