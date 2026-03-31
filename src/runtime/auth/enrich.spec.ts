import { describe, it, expect } from 'vitest'
import { enrichUserClaims } from './enrich'

describe('enrichUserClaims', () => {
  const baseUser = { sub: 'auth0|123', name: 'Alice', email: 'alice@example.com' }

  it('returns user unchanged when meData is null', () => {
    expect(enrichUserClaims(baseUser, null)).toEqual(baseUser)
  })

  it('merges meData into user claims', () => {
    const result = enrichUserClaims(baseUser, {
      id: 'gql-42',
      name: 'Alice B',
      email: 'alice@work.com',
      roles: ['admin', 'editor']
    })
    expect(result).toEqual({
      ...baseUser,
      tlv2_id: 'gql-42',
      tlv2_name: 'Alice B',
      tlv2_email: 'alice@work.com',
      tlv2_roles: ['admin', 'editor']
    })
  })

  it('defaults missing meData fields to empty values', () => {
    const result = enrichUserClaims(baseUser, {})
    expect(result.tlv2_id).toBe('')
    expect(result.tlv2_name).toBe('')
    expect(result.tlv2_email).toBe('')
    expect(result.tlv2_roles).toEqual([])
  })

  it('defaults undefined roles to empty array', () => {
    const result = enrichUserClaims(baseUser, { id: '1', roles: undefined })
    expect(result.tlv2_roles).toEqual([])
  })

  it('preserves original user claims', () => {
    const result = enrichUserClaims(baseUser, { id: '1' })
    expect(result.sub).toBe('auth0|123')
    expect(result.name).toBe('Alice')
    expect(result.email).toBe('alice@example.com')
  })

  it('tlv2 fields do not clobber by existing user keys', () => {
    const userWithExtra = { ...baseUser, tlv2_id: 'old-id' }
    const result = enrichUserClaims(userWithExtra, { id: 'new-id' })
    // meData wins via spread order
    expect(result.tlv2_id).toBe('new-id')
  })
})
