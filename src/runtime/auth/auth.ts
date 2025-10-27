import { navigateTo, useRuntimeConfig, useCsrf, useRoute } from '#imports'
import { createMixpanel } from '../lib/mixpanel'
import { getAuthorizeUrl, getLogoutUrl, checkToken } from '../lib/auth0'
import { useUser, clearUser } from './user'
import { logAuthDebug } from '../lib/log'

const logoutUri = '/'

/// ////////////////////
// Composables
/// ////////////////////

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

const useClientConfig = (clientName: string) => {
  const config = useRuntimeConfig()
  switch (clientName) {
    case 'stationEditor':
      return {
        server: '',
        client: config.public.tlv2?.apiBase?.stationEditor || ''
      }
    case 'feedManagement':
      return {
        server: '',
        client: config.public.tlv2?.apiBase?.feedManagement || ''
      }
  }
  return {
    server: config.tlv2?.proxyBase?.default || '',
    client: config.public.tlv2?.apiBase?.default || ''
  }
}

export const useApiEndpoint = (path?: string, clientName?: string) => {
  const apiConfig = useClientConfig(clientName || '')
  const apiBase = import.meta.server
    ? apiConfig.server
    : (apiConfig.client || window?.location?.origin + '/api/v2')
  const ret = apiBase + (path || '')
  console.log('useApiEndpoint:', { path, clientName, apibase: apiConfig }, '=>', ret)
  return ret
}

// Login
export const useLogin = async (targetUrl: null | string) => {
  logAuthDebug('useLogin')
  // Get current route's full path if no targetUrl provided
  const route = useRoute()
  targetUrl = targetUrl || route.fullPath
  return navigateTo(await getAuthorizeUrl(targetUrl), { external: true })
}

// Logout
export const useLogout = async () => {
  logAuthDebug('useLogout')
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
