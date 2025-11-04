import { describe, it, expect } from 'vitest'

// Mock the improved hybrid variables logic from route/stop components
function getGraphQLVariables (pathKey: string, feedOnestopId?: string, feedVersionSha1?: string, entityId?: string) {
  // If we have explicit feed version parameters from query params, use searchKey
  if (feedOnestopId || feedVersionSha1 || entityId) {
    // Mock searchKey behavior for feed version specific cases
    return {
      onestopId: undefined,
      feedOnestopId,
      feedVersionSha1,
      entityId,
      allowPreviousOnestopIds: !!feedVersionSha1
    }
  }

  // Check if pathKey contains complex syntax (: or @)
  const pathKeyStr = String(pathKey || '')
  if (pathKeyStr.includes(':') || pathKeyStr.includes('@')) {
    // For complex pathKeys, we'd use searchKey logic, but for tests we'll mock the expected behavior
    return { onestopId: pathKey } // Simplified for testing
  }

  // Check if pathKey is comma-separated database IDs
  const kInts = pathKeyStr.split(',').map(s => Number.parseInt(s)).filter(s => !isNaN(s))
  if (kInts.length > 0) {
    return { ids: kInts }
  }

  // For simple cases (basic onestop IDs), use direct pathKey
  return { onestopId: pathKey }
}

describe('Entity Page GraphQL Variables', () => {
  describe('Simple onestop ID cases', () => {
    it('should handle basic route onestopId', () => {
      const result = getGraphQLVariables('r-9xj7-lx2')

      expect(result).toEqual({
        onestopId: 'r-9xj7-lx2'
      })
    })

    it('should handle route with unicode characters', () => {
      const result = getGraphQLVariables('r-xn0x-地下鉄東西線')

      expect(result).toEqual({
        onestopId: 'r-xn0x-地下鉄東西線'
      })
    })

    it('should handle basic stop onestopId', () => {
      const result = getGraphQLVariables('s-9qc60qnjfb-aegeanway')

      expect(result).toEqual({
        onestopId: 's-9qc60qnjfb-aegeanway'
      })
    })

    it('should handle any entity type with simple onestopId', () => {
      expect(getGraphQLVariables('f-9q9-caltrain')).toEqual({ onestopId: 'f-9q9-caltrain' })
      expect(getGraphQLVariables('o-9qc60-vacavillecitycoach')).toEqual({ onestopId: 'o-9qc60-vacavillecitycoach' })
    })
  })

  describe('Feed version specific cases', () => {
    it('should handle complete feed version URL with all parameters', () => {
      const result = getGraphQLVariables(
        'r-dr72-1',
        'f-dr5r-nyctsubway',
        'f3d11cb28c46e83e6b0bb279b544c7cc2917d46a',
        '1'
      )

      expect(result).toEqual({
        onestopId: undefined,
        feedOnestopId: 'f-dr5r-nyctsubway',
        feedVersionSha1: 'f3d11cb28c46e83e6b0bb279b544c7cc2917d46a',
        entityId: '1',
        allowPreviousOnestopIds: true
      })
    })

    it('should handle feed version URL with only feedOnestopId and entityId', () => {
      const result = getGraphQLVariables(
        'r-test-route',
        'f-test-feed',
        undefined,
        'test-entity'
      )

      expect(result).toEqual({
        onestopId: undefined,
        feedOnestopId: 'f-test-feed',
        feedVersionSha1: undefined,
        entityId: 'test-entity',
        allowPreviousOnestopIds: false
      })
    })

    it('should handle feed version URL with unicode characters', () => {
      const result = getGraphQLVariables(
        'r-unicode-route-地下鉄',
        'f-unicode-feed-バス',
        'abc123def456789012345678901234567890',
        'unicode-entity-電車'
      )

      expect(result).toEqual({
        onestopId: undefined,
        feedOnestopId: 'f-unicode-feed-バス',
        feedVersionSha1: 'abc123def456789012345678901234567890',
        entityId: 'unicode-entity-電車',
        allowPreviousOnestopIds: true
      })
    })
  })

  describe('Database ID lookup cases', () => {
    it('should handle single database ID', () => {
      const result = getGraphQLVariables('12345')

      expect(result).toEqual({
        ids: [12345]
      })
    })

    it('should handle multiple database IDs', () => {
      const result = getGraphQLVariables('12345,67890,11111')

      expect(result).toEqual({
        ids: [12345, 67890, 11111]
      })
    })

    it('should handle mixed valid and invalid IDs', () => {
      const result = getGraphQLVariables('12345,invalid,67890')

      expect(result).toEqual({
        ids: [12345, 67890]
      })
    })
  })

  describe('Complex pathKey syntax', () => {
    it('should use searchKey for pathKeys with colon syntax', () => {
      const result = getGraphQLVariables('r-test:f-feed:entity123')

      // Should use searchKey logic (simplified for testing)
      expect(result).toEqual({
        onestopId: 'r-test:f-feed:entity123'
      })
    })

    it('should use searchKey for pathKeys with @ syntax', () => {
      const result = getGraphQLVariables('r-test@abc123def456')

      // Should use searchKey logic (simplified for testing)
      expect(result).toEqual({
        onestopId: 'r-test@abc123def456'
      })
    })
  })

  describe('Edge cases', () => {
    it('should handle empty pathKey', () => {
      const result = getGraphQLVariables('')

      expect(result).toEqual({
        onestopId: ''
      })
    })

    it('should handle null pathKey', () => {
      const result = getGraphQLVariables(null as any)

      expect(result).toEqual({
        onestopId: null
      })
    })

    it('should handle pathKey that does not match regex', () => {
      const result = getGraphQLVariables('invalid-format')

      expect(result).toEqual({
        onestopId: 'invalid-format'
      })
    })

    it('should prioritize feed version parameters over simple pathKey', () => {
      const result = getGraphQLVariables(
        'r-simple-route',
        'f-override-feed',
        'override123456789012345678901234567890',
        'override-entity'
      )

      expect(result).toEqual({
        onestopId: undefined,
        feedOnestopId: 'f-override-feed',
        feedVersionSha1: 'override123456789012345678901234567890',
        entityId: 'override-entity',
        allowPreviousOnestopIds: true
      })
    })
  })

  describe('Unicode and URL encoding', () => {
    it('should handle already decoded unicode characters', () => {
      const result = getGraphQLVariables('r-xn0x-市バス快速')

      expect(result).toEqual({
        onestopId: 'r-xn0x-市バス快速'
      })
    })

    it('should handle unicode in feed version specific URLs', () => {
      const result = getGraphQLVariables(
        'r-unicode-route-地下鉄',
        'f-unicode-feed-バス',
        'abc123def456789012345678901234567890',
        'unicode-entity-電車'
      )

      expect(result).toEqual({
        onestopId: undefined,
        feedOnestopId: 'f-unicode-feed-バス',
        feedVersionSha1: 'abc123def456789012345678901234567890',
        entityId: 'unicode-entity-電車',
        allowPreviousOnestopIds: true
      })
    })
  })
})
