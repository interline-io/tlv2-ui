import { useJwt } from '../plugins/auth'

/**
 * Returns both a pre-configured $fetch instance and raw fetch function with automatic JWT authentication
 * Usage: const { nuxtFetch, fetch } = useAuthenticatedFetchToBackend()
 *
 * - nuxtFetch: Nuxt's enhanced $fetch with automatic JSON parsing
 * - fetch: Native fetch API with headers pre-applied (for streaming, etc.)
 */
export const useAuthenticatedFetchToBackend = () => {
  /**
   * Pre-configured $fetch function with JWT authentication
   */
  const nuxtFetch = $fetch.create({
    async onRequest ({ request, options }) {
      // Get fresh JWT token
      const token = await useJwt()

      // Inject auth header if token exists
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
    // Get fresh JWT token
    const token = await useJwt()

    // Prepare headers
    const headers = new Headers(init?.headers)
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    // Call native fetch with enhanced headers
    return fetch(input, {
      ...init,
      headers
    })
  }

  return {
    nuxtFetch,
    fetch
  }
}
