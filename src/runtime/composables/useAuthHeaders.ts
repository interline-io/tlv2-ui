import { useRuntimeConfig, useRequestEvent, useCsrf } from '#imports'
import { getCookie } from 'h3'
import { AUTH_COOKIE } from '../server/utils/auth'

// Headers for API requests.
// Server-side: forwards user's JWT from cookie as Authorization header for SSR,
//   falls back to apikey for unauthenticated requests.
// Client-side: includes CSRF token when using proxy. JWT is sent automatically
//   via HttpOnly cookie (credentials: 'same-origin' in Apollo).
export const useAuthHeaders = async () => {
  const config = useRuntimeConfig()
  const headers: Record<string, string> = {}

  // Server side: forward user's JWT or fall back to API key
  if (import.meta.server) {
    const event = useRequestEvent()
    const token = event ? getCookie(event, AUTH_COOKIE) : undefined
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    } else if (config.tlv2?.graphqlApikey) {
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
