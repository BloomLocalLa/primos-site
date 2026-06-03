export function isCronAuthorized(headers = {}, secret, query = {}) {
  const bearer = (headers.authorization || '').replace(/^Bearer\s+/i, '')
  return Boolean(secret) && (bearer === secret || query.secret === secret)
}
