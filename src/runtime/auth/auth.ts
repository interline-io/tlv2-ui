import { navigateTo, useRuntimeConfig, useCsrf, useRoute } from '#imports'
import { useMixpanel } from '../composables/useMixpanel'
import { useUser, clearUser } from './user'
import { getAuthorizeUrl, getLogoutUrl, checkToken } from './auth0'

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
  if (config.public.useProxy) {
    const { headerName: csrfHeader, csrf: csrfToken } = useCsrf()
    headers[csrfHeader] = csrfToken
  }

  // JWT
  const token = await useJwt()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Api key
  if (import.meta.server && config.graphqlApikey) {
    headers['apikey'] = config.graphqlApikey
  }

  return headers
}

export const useApiEndpoint = () => {
  const config = useRuntimeConfig()
  return import.meta.server
    ? (config.proxyBase)
    : (config.public.apiBase || window?.location?.origin + '/api/v2')
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
  const mixpanel = useMixpanel()
  mixpanel.reset()
  return navigateTo(await getLogoutUrl(logoutUri), { external: true })
}

/// ////////////////////
// User
/// ////////////////////

export const useLoginGate = (role?: string): boolean => {
  // console.log('useLoginGate')
  const config = useRuntimeConfig()
  // console.log(config.public.loginGate)
  if (config.public.loginGate) {
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
