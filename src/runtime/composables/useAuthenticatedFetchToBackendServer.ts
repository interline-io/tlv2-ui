import type { H3Event } from 'h3'
import { extractJwtFromEvent } from '../server-utils/jwt'

/**
 * Server-side composable that returns pre-configured fetch handlers with JWT authentication
 * extracted from the H3 event context.
 *
 * Usage: const { nuxtFetch, fetch } = useAuthenticatedFetchToBackendServer(event)
 *
 * - nuxtFetch: Nuxt's enhanced $fetch with automatic JSON parsing
 * - fetch: Native fetch API with headers pre-applied (for streaming, etc.)
 */
export const useAuthenticatedFetchToBackendServer = (event: H3Event) => {
  const { getJwt } = extractJwtFromEvent(event)

  /**
   * Pre-configured $fetch function with JWT authentication from server context
   */
  const nuxtFetch = $fetch.create({
    onRequest ({ options }) {
      const token = getJwt()

      if (token) {
        const headers = new Headers(options.headers)
        headers.set('Authorization', `Bearer ${token}`)
        options.headers = headers
      }
    }
  })

  /**
   * Raw fetch function with JWT authentication pre-applied
   * Returns the native Response object for streaming, custom parsing, etc.
   */
  const fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const token = getJwt()

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
    nuxtFetch,
    fetch
  }
}

/**
 * Type for the server-side authenticated fetch composable
 */
export type AuthenticatedFetchToBackendServer = ReturnType<typeof useAuthenticatedFetchToBackendServer>
