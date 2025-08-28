import { getHeader, createError, type H3Event } from 'h3'

// Options interface for useApiFetch
export interface ApiFetchOptions {
  headers?: Record<string, string>
  apiBase?: string
  apiKey?: string
  jwt?: string
  event?: H3Event
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
export const useApiFetch = (options: ApiFetchOptions = {}) => {
  const { apiBase, jwt, event, apiKey, headers } = options

  const resolveUrl = (input: string | URL | Request): string => {
    if (typeof input === 'string') {
      // If it's a relative path starting with '/', prepend API base
      if (input.startsWith('/')) {
        return apiBase + input
      }
      // If it doesn't start with protocol, assume it's relative and prepend API base
      if (!input.includes('://')) {
        const path = '/' + input
        return apiBase + path
      }
    }
    return input.toString()
  }

  const fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    // Resolve URL to API base if needed
    const resolvedInput = typeof input === 'string' ? resolveUrl(input) : input

    // Get auth headers based on context
    let authHeaders: Record<string, string> = { ...headers }
    if (jwt) {
      authHeaders['Authorization'] = `Bearer ${jwt}`
    } else if (event) {
      authHeaders['Authorization'] = `Bearer ${extractJwtFromEvent(event)}`
    } else if (apiKey) {
      authHeaders['apikey'] = apiKey
    }

    // Merge headers
    const requestHeaders = new Headers(init?.headers)
    Object.entries(authHeaders).forEach(([key, value]) => {
      requestHeaders.set(key, value)
    })

    // Call native fetch with resolved URL and enhanced headers
    return globalThis.fetch(resolvedInput, {
      ...init,
      headers: requestHeaders
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
  return {
    getEventJwt,
  }
}
