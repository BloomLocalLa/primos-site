import { describe, it, expect } from 'vitest'
import { isCronAuthorized } from './cron-auth.js'

describe('isCronAuthorized', () => {
  it('accepts a matching bearer token', () => {
    expect(isCronAuthorized({ authorization: 'Bearer s3cret' }, 's3cret')).toBe(true)
  })
  it('accepts a matching secret query param', () => {
    expect(isCronAuthorized({}, 's3cret', { secret: 's3cret' })).toBe(true)
  })
  it('rejects a wrong/missing secret', () => {
    expect(isCronAuthorized({ authorization: 'Bearer nope' }, 's3cret')).toBe(false)
    expect(isCronAuthorized({}, 's3cret', {})).toBe(false)
  })
})
