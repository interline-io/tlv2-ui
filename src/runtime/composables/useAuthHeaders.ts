import { useRuntimeConfig, useCsrf } from '#imports'

// Headers for API requests.
// Server-side: includes apikey for backend access.
// Client-side: includes CSRF token when using proxy. JWT is sent automatically
// via HttpOnly cookie (credentials: 'same-origin' in Apollo).
export const useAuthHeaders = async () => {
  const config = useRuntimeConfig()
  const headers: Record<string, string> = {}

  // Server side: API key for backend access
  if (import.meta.server) {
    if (config.tlv2?.graphqlApikey) {
      headers['apikey'] = config.tlv2?.graphqlApikey
    }
  }

  // Client side: CSRF token for proxy requests
  if (import.meta.client) {
    if (config.public.tlv2?.useProxy) {
      const { headerName: csrfHeader, csrf: csrfToken } = useCsrf()
      headers[csrfHeader] = csrfToken
    }
  }

  return headers
}
