import { useRuntimeConfig, useCsrf } from '#imports'
import { getHeader, createError, type H3Event } from 'h3'
import { useJwt } from './auth'

// Headers, configured from JWT on H3Event
export const useAuthHeadersFromEvent = async (event: H3Event) => {
  const { getEventJwt } = extractJwtFromEvent(event)
  const token = getEventJwt()
  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

// Headers, configured from user context, including CSRF
export const useAuthHeaders = async () => {
  const config = useRuntimeConfig()
  const headers: Record<string, string> = {}

  // CSRF
  // NOTE: For unknown reasons, useCsrf will panic if called after useJwt.
  if (config.public.useProxy) {
    const { headerName: csrfHeader, csrf: csrfToken } = useCsrf()
    headers[csrfHeader] = csrfToken
  }

  // JWT
  const token = await useJwt()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Api key
  if (import.meta.server && config.graphqlApikey) {
    headers['apikey'] = config.graphqlApikey
  }

  return headers
}

// Return url relative to public API base, or proxy if configured
export const useApiEndpoint = (path?: string) => {
  const config = useRuntimeConfig()
  const base = import.meta.server
    ? (config.proxyBase)
    : (config.public.apiBase || window?.location?.origin + '/api/v2')
  if (path) {
    return base + path
  }
  return base
}

/**
 * Returns authenticated fetch functions with automatic API base path resolution
 * Usage: const { nuxtFetch, fetch } = useApiFetch()
 *
 * - nuxtFetch: Nuxt's enhanced $fetch with automatic JSON parsing, auth headers, and API base path
 * - fetch: Native fetch API with auth headers and API base path pre-applied
 *
 * Relative paths (starting with '/') are automatically resolved to the API base.
 * Absolute URLs (with protocol) are used as-is.
 */
export const useApiFetch = () => {
  const resolveUrl = (input: string | URL | Request): string => {
    if (typeof input === 'string') {
      // If it's a relative path starting with '/', prepend API base
      if (input.startsWith('/')) {
        return useApiEndpoint(input)
      }
      // If it doesn't start with protocol, assume it's relative and prepend API base
      if (!input.includes('://')) {
        return useApiEndpoint('/' + input)
      }
    }
    return input.toString()
  }

  const fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    // Resolve URL to API base if needed
    const resolvedInput = typeof input === 'string' ? resolveUrl(input) : input

    // Get all auth headers (JWT, CSRF, API key)
    const authHeaders = await useAuthHeaders()

    // Merge headers
    const headers = new Headers(init?.headers)
    Object.entries(authHeaders).forEach(([key, value]) => {
      headers.set(key, value)
    })

    // Call native fetch with resolved URL and enhanced headers
    return globalThis.fetch(resolvedInput, {
      ...init,
      headers
    })
  }

  return {
    fetch
  }
}

/**
 * Server-side composable that returns pre-configured fetch handlers with authentication
 * extracted from the H3 event context.
 *
 * Usage: const { nuxtFetch, fetch } = useAuthenticatedFetchFromEvent(event)
 *
 * - nuxtFetch: Nuxt's enhanced $fetch with automatic JSON parsing
 * - fetch: Native fetch API with headers pre-applied (for streaming, etc.)
 */
export const useAuthenticatedFetchFromEvent = (event: H3Event) => {
  const { getEventJwt } = extractJwtFromEvent(event)

  /**
   * Raw fetch function with JWT authentication pre-applied
   * Returns the native Response object for streaming, custom parsing, etc.
   */
  const fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const token = getEventJwt()

    const headers = new Headers(init?.headers)
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    return globalThis.fetch(input, {
      ...init,
      headers
    })
  }

  return {
    fetch
  }
}

export const extractJwtFromEvent = (event: H3Event) => {
  const getEventJwt = (): string | null => {
    const authHeader = getHeader(event, 'authorization')
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.replace('Bearer ', '')
    }
    return null
  }

  const requireJwt = (): string => {
    const token = getEventJwt()
    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required - JWT token not provided'
      })
    }
    return token
  }

  const hasJwt = (): boolean => {
    return getEventJwt() !== null
  }

  return {
    getEventJwt,
    requireJwt,
    hasJwt
  }
}
