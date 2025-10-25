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

export const useApiEndpoint = (path?: string) => {
  const config = useRuntimeConfig()
  const apiBase = import.meta.server
    ? (config.tlv2?.proxyBase)
    : (config.public.tlv2?.apiBase || window?.location?.origin + '/api/v2')
  return apiBase + (path || '')
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

export const useLoginGate = (role?: string, anyRole?: string[], excludeRoles?: string[]): boolean => {
  // Get config
  const config = useRuntimeConfig()
  if (!config.public.tlv2?.loginGate) {
    // Login gate disabled: always authorized
    return true
  }
  // Get user
  const user = useUser()
  if (!user.loggedIn) {
    // Not logged in: not authorized
    return false
  }

  // Combine options
  anyRole = anyRole || []
  if (role) {
    anyRole.push(role)
  }

  // Check exclusions and roles
  for (const excludeRole of excludeRoles || []) {
    if (user.hasRole(excludeRole)) {
      // Has an excluded role: not authorized
      return false
    }
  }
  for (const r of anyRole || []) {
    if (user.hasRole(r)) {
      // Has one of the anyRoles: authorized
      return true
    }
  }
  return false
}
