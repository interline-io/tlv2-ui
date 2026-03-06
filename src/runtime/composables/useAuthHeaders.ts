import { useRuntimeConfig, useCsrf } from '#imports'
import { checkToken } from '../lib/auth/auth0'
import { clearUser } from '../lib/auth'
import { logAuthDebug } from '../lib/util/log'

// JWT (client auth mode only)
const useJwt = async () => {
  const { token, mustReauthorize } = await checkToken()
  if (mustReauthorize) {
    logAuthDebug('useJwt: mustReauthorize')
    clearUser()
    return ''
  }
  return token
}

// Headers, including CSRF
export const useAuthHeaders = async () => {
  const config = useRuntimeConfig()
  const headers: Record<string, string> = {}
  const serverAuth = !!(config.public.tlv2 as any)?.serverAuth

  // Server side configuration
  if (import.meta.server) {
    // Api key
    if (config.tlv2?.graphqlApikey) {
      headers['apikey'] = config.tlv2?.graphqlApikey
    }
  }

  // Client side configuration
  if (import.meta.client) {
    // CSRF (needed for both auth modes when using proxy)
    if (config.public.tlv2?.useProxy) {
      const { headerName: csrfHeader, csrf: csrfToken } = useCsrf()
      headers[csrfHeader] = csrfToken
    }

    // JWT (client auth mode only — server auth uses HttpOnly cookie sent automatically)
    if (!serverAuth) {
      const token = await useJwt()
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }
  }
  return headers
}
