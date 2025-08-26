import { getHeader, createError } from 'h3'

/**
 * Server-side composable for extracting JWT tokens from Nuxt 3 HTTP requests on the backend
 * Usage: const { getJwt, requireJwt } = useJwtOnBackend(event)
 */
export const useJwtOnBackend = (event: any) => {
  /**
   * Extract JWT token from Authorization header
   * @returns JWT token string or null if not present
   */
  const getJwt = (): string | null => {
    const authHeader = getHeader(event, 'authorization')
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.replace('Bearer ', '')
    }
    return null
  }

  /**
   * Require JWT token - throws error if not present
   * @returns JWT token string
   * @throws 401 error if no token provided
   */
  const requireJwt = (): string => {
    const token = getJwt()
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required - JWT token not provided'
      })
    }
    return token
  }

  /**
   * Check if request has valid JWT token
   * @returns boolean indicating if token is present
   */
  const hasJwt = (): boolean => {
    return getJwt() !== null
  }

  /**
   * Get JWT token with optional validation
   * @param required - If true, throws error when no token (default: false)
   * @returns JWT token string or null
   * @throws 401 error if required=true and no token provided
   */
  const getJwtToken = (required: boolean = false): string | null => {
    if (required) {
      return requireJwt()
    }
    return getJwt()
  }

  return {
    getJwt,
    requireJwt,
    hasJwt,
    getJwtToken
  }
}

/**
 * Type for the JWT on backend composable
 */
export type JwtOnBackend = ReturnType<typeof useJwtOnBackend>
