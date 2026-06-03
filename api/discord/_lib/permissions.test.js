import { describe, it, expect } from 'vitest'
import { isAuthorized } from './permissions.js'

describe('isAuthorized', () => {
  it('is true when the member has the mod role', () => {
    expect(isAuthorized({ roles: ['111', '222'] }, '222')).toBe(true)
  })
  it('is false when the member lacks the mod role', () => {
    expect(isAuthorized({ roles: ['111'] }, '222')).toBe(false)
  })
  it('is false for missing member or roles', () => {
    expect(isAuthorized(undefined, '222')).toBe(false)
    expect(isAuthorized({}, '222')).toBe(false)
  })
})
