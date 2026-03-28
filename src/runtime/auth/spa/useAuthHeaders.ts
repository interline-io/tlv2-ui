import { useRuntimeConfig, useCsrf } from '#imports'
import { checkToken } from './auth0'
import { clearUser } from './useUser'
import { logAuthDebug } from '../../lib/util/log'

// JWT
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
export const useAuthHeaders = async (): Promise<Record<string, string>> => {
  const config = useRuntimeConfig()
  const headers: Record<string, string> = {}

  // Server side configuration
  if (import.meta.server) {
    // Api key
    if (config.tlv2?.graphqlApikey) {
      headers['apikey'] = config.tlv2?.graphqlApikey
    }
  }

  // Client side configuration
  if (import.meta.client) {
    // CSRF
    const { headerName: csrfHeader, csrf: csrfToken } = useCsrf()
    headers[csrfHeader] = csrfToken
    // JWT
    const token = await useJwt()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  return headers
}
