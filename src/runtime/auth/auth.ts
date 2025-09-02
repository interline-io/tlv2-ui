import { navigateTo, useRuntimeConfig, useCsrf, useRoute, addRouteMiddleware } from '#imports'
import { defineNuxtPlugin } from 'nuxt/app'
import { Auth0Client } from '@auth0/auth0-spa-js'
import { useStorage } from '@vueuse/core'
import { gql } from 'graphql-tag'
import { useMixpanel } from '../composables/useMixpanel'
import { User } from '../lib/user'
import { getApolloClient } from '../lib/apollo'

/// ////////////////////
// Auth0 client initialization
/// ////////////////////

const RECHECK_INTERVAL = 600_000

// Auth0 client init
let authInit = false
let authClient: Auth0Client
let requireLogin = false
let logoutUri = '/'
let graphqlUser = true

export function getAuth0Client () {
  if (process.server) {
    return
  }
  if (authInit) {
    return authClient
  }

  // Check if we are configured correctly
  const config = useRuntimeConfig()
  if (config.public.auth0ClientId) {
    // Update global config
    requireLogin = !!config.public.requireLogin
    logoutUri = String(config.public.auth0LogoutUri || window?.location?.origin || '/')
    graphqlUser = config.public.graphqlUser !== false

    const scope = String(config.public.auth0Scope)
    debugLog('auth0 init:', { scope })

    // Create and return global auth0 client
    authClient = new Auth0Client({
      domain: String(config.public.auth0Domain),
      clientId: String(config.public.auth0ClientId),
      cacheLocation: 'localstorage',
      useRefreshTokens: false, // Use iframe method for token refresh
      authorizationParams: {
        redirect_uri: String(config.public.auth0RedirectUri || window?.location?.origin || '/'),
        audience: String(config.public.auth0Audience),
        scope: scope
      }
    })
  }

  // Set as initialized
  // (even if not available, to avoid future runtime config check)
  authInit = true
  return authClient
}

/// ////////////////////
// Composables
/// ////////////////////

// JWT
export const useJwt = async () => {
  const { token, mustReauthorize } = await checkToken()
  if (mustReauthorize) {
    debugLog('useJwt: mustReauthorize')
    await useLogin(null)
    return ''
  }
  return token
}

export const useUser = () => {
  const user = useStorage('user', {})
  return new User(user?.value || {})
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

export function clearUser () {
  debugLog('clearUser')
  const checkUser = useStorage('user', {})
  checkUser.value = new User({ loggedIn: false })
}

// Build the user from auth0 data and GraphQL me response
export async function buildUser () {
  // Build user object
  const client = getAuth0Client()
  if (!client) {
    return
  }

  // Get auth0 user data
  debugLog('buildUser')
  const auth0user = await client.getUser()
  if (!auth0user) {
    debugLog('buildUser: missing auth0 data, clearing user')
    clearUser()
    return
  }

  debugLog('buildUser: auth0 user:', auth0user)

  // Get additional user metadata from GraphQL
  let meData: any = null
  if (graphqlUser) {
    try {
      const apolloClient = getApolloClient()
      const response = await apolloClient.query({
        query: gql`query{me{id name email external_data roles}}`
      })
      meData = response.data?.me || null
      debugLog('buildUser: me graphql response:', meData)

      if (!meData) {
        debugLog('buildUser: missing graphql data')
        clearUser()
        return
      }
    } catch (e) {
      debugLog('buildUser: graphql failed:', e)
      clearUser()
      return
    }
  }

  // Set user state
  debugLog('buildUser: set user state')
  const checkUser = useStorage('user', {})
  const builtUser = new User({
    loggedIn: true,
    id: meData?.id || '',
    name: auth0user?.name || '',
    email: auth0user?.email || '',
    externalData: meData?.external_data || {},
    roles: meData?.roles || [],
    checked: Date.now()
  })
  checkUser.value = builtUser
}

/// ////////////////////
// Helpers
/// ////////////////////

// Check the client token, return { token, loggedIn, mustReauthorize }
// mustReauthorize will be set to true if a user is logged in but token fails
export async function checkToken () {
  let token = ''
  let loggedIn = false
  let mustReauthorize = false
  const client = getAuth0Client()
  if (!client) {
    debugLog('checkToken: no client')
    return { token, loggedIn, mustReauthorize }
  }

  try {
    // First check if we're authenticated
    loggedIn = await client.isAuthenticated()
    if (!loggedIn) {
      debugLog('checkToken: not logged in')
      return { token, loggedIn, mustReauthorize }
    }

    // Get a fresh token
    const tokenResponse = await client.getTokenSilently({ detailedResponse: true })
    token = tokenResponse.access_token
    loggedIn = true
  } catch (error: any) {
    debugLog('checkToken: error:', error)
    if (error.error === 'login_required') {
      mustReauthorize = true
      clearUser()
    }
  }

  return { token, loggedIn, mustReauthorize }
}

// Get an auth0 /authorize url that also includes targetUrl in app state
export async function getAuthorizeUrl (targetUrl: null | string): Promise<string> {
  targetUrl = targetUrl || '/'
  const client = getAuth0Client()
  if (!client) {
    return targetUrl
  }
  let authorizationUrl = ''
  await client.loginWithRedirect({
    appState: { targetUrl },
    openUrl (url) {
      authorizationUrl = url
    }
  })
  return authorizationUrl
}

// Get an auth0 logout url
export async function getLogoutUrl (targetUrl: null | string): Promise<string> {
  targetUrl = targetUrl || '/'
  const client = getAuth0Client()
  if (!client) {
    return targetUrl
  }
  let authorizationUrl = ''
  await client.logout({
    logoutParams: {
      returnTo: targetUrl
    },
    openUrl (url) {
      authorizationUrl = url
    }
  })
  return authorizationUrl
}

function debugLog (msg: string, ...args: any) {
  console.log(msg, ...args)
}

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

export const defineAuthPlugin = defineNuxtPlugin(() => {
  addRouteMiddleware('global-auth', async (to, _) => {
    // Check if client is configured
    const config = useRuntimeConfig()
    const client = getAuth0Client()
    if (!client) {
      return
    }

    // Handle auth0 redirect callback
    const query = to?.query
    if (query && query.code && query.state) {
      try {
        debugLog('auth mw: handle login')
        const { appState } = await client.handleRedirectCallback()
        debugLog('auth mw: got appState:', appState)
        await buildUser()

        const targetPath = appState?.targetUrl || '/'
        debugLog('auth mw: navigating to:', targetPath)
        return navigateTo(targetPath, { replace: true })
      } catch (e) {
        debugLog('auth mw: handleRedirectCallback failed:', e)
        clearUser()
        return navigateTo(await getAuthorizeUrl(to.fullPath), { external: true })
      }
    }

    // Check token state
    const { loggedIn, mustReauthorize } = await checkToken()
    const requireLogin = !!config.public.requireLogin
    if (mustReauthorize || (requireLogin && !loggedIn)) {
      debugLog('auth mw: need auth')
      return navigateTo(await getAuthorizeUrl(to.fullPath), { external: true })
    }

    // Check user data freshness
    const user = useUser()
    if (loggedIn) {
      const lastChecked = Date.now() - (user?.checked || 0)
      if (lastChecked > RECHECK_INTERVAL || !user?.id) {
        debugLog('auth mw: recheck user')
        await buildUser()
      }
    } else {
      clearUser()
    }
  }, {
    global: true
  })
})
