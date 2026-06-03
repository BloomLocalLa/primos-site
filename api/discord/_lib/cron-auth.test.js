import { describe, it, expect } from 'vitest'
import { isCronAuthorized } from './cron-auth.js'

describe('isCronAuthorized', () => {
  it('accepts a matching bearer token', () => {
    expect(isCronAuthorized({ authorization: 'Bearer s3cret' }, 's3cret')).toBe(true)
  })
  it('rejects a wrong bearer token', () => {
    expect(isCronAuthorized({ authorization: 'Bearer nope' }, 's3cret')).toBe(false)
  })
  it('rejects a missing Authorization header', () => {
    expect(isCronAuthorized({}, 's3cret')).toBe(false)
  })
  it('does NOT accept the secret via a URL query param (secrets must not be in URLs)', () => {
    // A 3rd query arg is ignored entirely — header is the only accepted transport.
    expect(isCronAuthorized({}, 's3cret', { secret: 's3cret' })).toBe(false)
  })
  it('returns false when no secret is configured', () => {
    expect(isCronAuthorized({ authorization: 'Bearer anything' }, undefined)).toBe(false)
  })
})
