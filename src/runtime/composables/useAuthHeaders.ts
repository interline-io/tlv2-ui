import { useRuntimeConfig, useCsrf } from '#imports'
import { checkToken } from '../lib/auth0'
import { clearUser } from '../auth/user'
import { logAuthDebug } from '../lib/log'

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
export const useAuthHeaders = async () => {
  const config = useRuntimeConfig()
  const headers: Record<string, string> = {}

  // CSRF
  // NOTE: For unknown reasons, useCsrf will panic if called after useJwt.
  if (config.public.tlv2?.useProxy) {
    const { headerName: csrfHeader, csrf: csrfToken } = useCsrf()
    headers[csrfHeader] = csrfToken
  }

  // JWT
  const token = await useJwt()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Api key
  if (import.meta.server && config.tlv2?.graphqlApikey) {
    headers['apikey'] = config.tlv2?.graphqlApikey
  }
  return headers
}
