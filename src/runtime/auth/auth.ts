import { navigateTo, useRuntimeConfig, useCsrf, useRoute } from '#imports'
import { createMixpanel } from '../lib/mixpanel'
import { getAuthorizeUrl, getLogoutUrl, checkToken } from '../lib/auth0'
import { useUser, clearUser } from './user'

const logoutUri = '/'

/// ////////////////////
// Composables
/// ////////////////////

// JWT
const useJwt = async () => {
  const { token, mustReauthorize } = await checkToken()
  if (mustReauthorize) {
    debugLog('useJwt: mustReauthorize')
    clearUser()
    await useLogin(null)
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

export const useApiEndpoint = (path?: string) => {
  const config = useRuntimeConfig()
  const apiBase = import.meta.server
    ? (config.tlv2?.proxyBase)
    : (config.public.tlv2?.apiBase || window?.location?.origin + '/api/v2')
  return apiBase + (path || '')
}

// Login
export const useLogin = async (targetUrl: null | string) => {
  debugLog('useLogin')
  // Get current route's full path if no targetUrl provided
  const route = useRoute()
  targetUrl = targetUrl || route.fullPath
  debugLog('useLogin with targetUrl:', targetUrl)
  return navigateTo(await getAuthorizeUrl(targetUrl), { external: true })
}

// Logout
export const useLogout = async () => {
  debugLog('useLogout')
  // Reset Mixpanel before redirecting
  const config = useRuntimeConfig()
  const mixpanel = createMixpanel(config.public.tlv2?.mixpanelApikey, useUser())
  mixpanel.reset()
  return navigateTo(await getLogoutUrl(logoutUri), { external: true })
}

/// ////////////////////
// User
/// ////////////////////

export const useLoginGate = (role?: string): boolean => {
  // console.log('useLoginGate')
  const config = useRuntimeConfig()
  if (config.public.tlv2?.loginGate) {
    // console.log('useLoginGate: config is true')
    const user = useUser()
    if (user?.loggedIn) {
      // console.log('user??', user, 'role:', role, 'has role:', user.hasRole(role))
      // console.log('useLoginGate: user is logged in')
      if (role) {
        return !user.hasRole(role)
      }
      return false
    }
    // console.log('useLoginGate: user not logged in, login required')
    return true
  }
  return false
}

function debugLog (msg: string, ...args: any) {
  console.log(msg, ...args)
}
