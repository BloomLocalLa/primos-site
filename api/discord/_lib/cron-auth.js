import crypto from 'node:crypto'

// Authorize cron requests via the `Authorization: Bearer <secret>` header ONLY.
// The secret is never read from the URL/query string — secrets in URLs leak into
// access logs, proxies, and browser history. Comparison is constant-time.
export function isCronAuthorized(headers = {}, secret) {
  if (!secret) return false
  // Trim both sides: a stray trailing newline/space on the env var or the bearer
  // header is a common footgun that otherwise causes silent 401s.
  const bearer = (headers.authorization || '').replace(/^Bearer\s+/i, '').trim()
  const provided = Buffer.from(bearer)
  const expected = Buffer.from(String(secret).trim())
  return provided.length === expected.length && crypto.timingSafeEqual(provided, expected)
}
