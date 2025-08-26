import { getHeader, createError, type H3Event } from 'h3'

/**
 * Server-side utility for extracting JWT tokens from Nuxt 3 HTTP requests on the backend
 * Usage: const { getJwt, requireJwt } = extractJwtFromEvent(event)
 *
 * This is placed in tlv2-ui runtime utils so it can be shared across applications
 * and properly access Nuxt composables when imported into server contexts
 */
export const extractJwtFromEvent = (event: H3Event) => {
  const getJwt = (): string | null => {
    const authHeader = getHeader(event, 'authorization')
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.replace('Bearer ', '')
    }
    return null
  }

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

  const hasJwt = (): boolean => {
    return getJwt() !== null
  }

  return {
    getJwt,
    requireJwt,
    hasJwt
  }
}

/**
 * Type for the JWT extraction utility
 */
export type JwtExtractor = ReturnType<typeof extractJwtFromEvent>
