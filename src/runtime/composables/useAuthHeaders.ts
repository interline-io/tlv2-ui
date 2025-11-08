import { useRuntimeConfig, useCsrf, useCookie } from '#imports'

/**
 * Auth headers for the three-tier architecture:
 * 1. Client → Proxy: Sends cookie + CSRF token
 * 2. Proxy reads cookie → Upstream: Sends Authorization header
 * 3. SSR reads cookie → Upstream: Sends Authorization header
 */
export const useAuthHeaders = () => {
  const config = useRuntimeConfig()
  const headers: Record<string, string> = {}

  // SERVER (SSR): Read JWT from client cookie, forward to upstream GraphQL
  if (import.meta.server) {
    // API key for server-side requests
    if (config.tlv2?.graphqlApikey) {
      headers.apikey = config.tlv2.graphqlApikey
    }

    // SSR: Read JWT from client cookie and forward via Authorization header
    const authToken = useCookie('auth-token')
    if (authToken.value) {
      headers.Authorization = `Bearer ${authToken.value}`
    }
  }

  // CLIENT: Add CSRF protection for proxy (cookie sent automatically by browser)
  if (import.meta.client) {
    // CSRF required by proxy to prevent abuse from public endpoints
    if (config.public.tlv2?.useProxy) {
      const { headerName: csrfHeader, csrf: csrfToken } = useCsrf()
      headers[csrfHeader] = csrfToken
    }
  }

  return headers
}
