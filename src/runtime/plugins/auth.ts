import { Auth0Client } from '@auth0/auth0-spa-js'
import { useStorage } from '@vueuse/core'
import { gql } from 'graphql-tag'
import { getApolloClient } from './apollo'
import { defineNuxtPlugin, addRouteMiddleware, navigateTo, useRuntimeConfig } from '#imports'

/// ////////////////////
// Auth0 client initialization
/// ////////////////////

const RECHECK_INTERVAL = 600_000

// Auth0 client init
let authInit = false
let authClient: Auth0Client
let requireLogin = false
let logoutUri = '/'

export function getAuth0Client() {
  if (process.server) {
    return
  }
  if (authInit) {
    return authClient
  }

  debugLog('getAuth0Client: start')
  // Check if we are configured correctly
  const config = useRuntimeConfig()
  if (config.public.auth0ClientId) {
    // Update global config
    requireLogin = !!config.public.requireLogin
    logoutUri = String(config.public.auth0LogoutUri || window?.location?.origin || '/')

    // Create and return global auth0 client
    authClient = new Auth0Client({
      domain: String(config.public.auth0Domain),
      clientId: String(config.public.auth0ClientId),
      cacheLocation: 'localstorage',
      authorizationParams: {
        redirect_uri: String(config.public.auth0RedirectUri || window?.location?.origin || '/'),
        audience: String(config.public.auth0Audience),
        scope: String(config.public.auth0Scope)
      }
    })
  }

  // Set as initialized
  // (even if not available, to avoid future runtime config check)
  authInit = true
  debugLog('getAuth0Client: done')
  return authClient
}

/// ////////////////////
// Composables
/// ////////////////////

// JWT
export const useJwt = async() => {
  debugLog('useJwt: start')
  const { token, mustReauthorize } = await checkToken()
  if (mustReauthorize) {
    debugLog('useJwt: mustReauthorize')
    await useLogin(null)
    return ''
  }
  debugLog('useJwt: done')
  return token
}

export const useUser = () => {
  debugLog('useUser: start')
  const user = useStorage('user', {})
  debugLog('useUser: done')
  return new User(user?.value || {})
}

// Login
export const useLogin = async(targetUrl: null | string) => {
  debugLog('useLogin: start')
  targetUrl = targetUrl || `${window?.location?.pathname}${window?.location?.search}`
  debugLog('useLogin: login, targetUrl:', targetUrl)
  return navigateTo(await getAuthorizeUrl(targetUrl), { external: true })
}

// Logout
export const useLogout = async() => {
  debugLog('auth: logout')
  return navigateTo(await getLogoutUrl(logoutUri), { external: true })
}

/// ////////////////////
// User
/// ////////////////////

export class User {
  loggedIn = false
  id = ''
  name = ''
  email = ''
  roles = []
  externalData = {}
  checked = 0
  constructor(v: any) {
    Object.assign(this, v)
  }

  hasRole(v: string): boolean {
    for (const s of this.roles) {
      if (s === v) {
        return true
      }
    }
    return false
  }
}

function clearUser() {
  debugLog('clearUser: start')
  const checkUser = useStorage('user', {})
  checkUser.value = new User({ loggedIn: false })
  debugLog('clearUser: done')
}

// Build the user from auth0 data and GraphQL me response
async function buildUser() {
  debugLog('buildUser: start')

  // Build user object
  const client = getAuth0Client()
  if (!client) {
    return
  }

  // Get auth0 user data
  const auth0user = await client.getUser()
  debugLog('buildUser: auth0 user:', auth0user)

  // Get additional user metadata from GraphQL
  const apolloClient = getApolloClient()
  const meData = await apolloClient.query({
    query: gql`query{me{id name email external_data roles}}`
  }).then((data) => {
    debugLog('buildUser: me graphql response:', data.data.me)
    return data.data.me
  }).catch((e) => {
    debugLog('buildUser: graphql failed:', e)
  })

  if (!auth0user || !meData) {
    debugLog('buildUser: missing auth0 or graphql data, clearing user')
    clearUser()
    return
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
  debugLog('buildUser: done:', builtUser)
}

/// ////////////////////
// Helpers
/// ////////////////////

// Check the client token, return { token, loggedIn, mustReauthorize }
// mustReauthorize will be set to true if a user is logged in but token fails
async function checkToken() {
  debugLog('checkToken: start')
  const token = ''
  let loggedIn = false
  let mustReauthorize = false
  const client = getAuth0Client()
  if (!client) {
    debugLog('checkToken: no client')
    return { token, loggedIn, mustReauthorize }
  }
  if (await client.isAuthenticated()) {
    debugLog('checkToken: loggedIn')
    loggedIn = true
    try {
      // Everything is OK
      const tokenResponse = await client.getTokenSilently({ timeoutInSeconds: 1, detailedResponse: true })
      console.log('checkToken: tokenResponse:', tokenResponse)
      const token = tokenResponse.access_token
      debugLog('checkToken: got token:', token)
    } catch (error) {
      // Invalid token
      debugLog('checkToken: error in getTokenSilently; must authorize again:', error)
      mustReauthorize = true
    }
  } else {
    debugLog('checkToken: not logged in')
  }
  debugLog('checkToken: done')
  return { token, loggedIn, mustReauthorize }
}

// Get an auth0 /authorize url that also includes targetUrl in app state
async function getAuthorizeUrl(targetUrl: null | string): Promise<string> {
  debugLog('getAuthorizeUrl: start')
  targetUrl = targetUrl || '/'
  const client = getAuth0Client()
  if (!client) {
    return targetUrl
  }
  let authorizationUrl = ''
  await client.loginWithRedirect({
    appState: { targetUrl },
    openUrl(url) {
      authorizationUrl = url
    }
  })
  debugLog('getAuthorizeUrl: done')
  return authorizationUrl
}

// Get an auth0 logout url
async function getLogoutUrl(targetUrl: null | string): Promise<string> {
  debugLog('getLogoutUrl: start')
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
    openUrl(url) {
      authorizationUrl = url
    }
  })
  debugLog('getLogoutUrl: done')
  return authorizationUrl
}

function debugLog(msg: string, ...args: any) {
  console.log(msg, ...args)
}

/// ////////////////////
// Middleware
/// ////////////////////

export default defineNuxtPlugin(() => {
  addRouteMiddleware('global-auth', async (to, _) => {
    debugLog('auth mw: start')

    // Check if client is configured
    const client = getAuth0Client()
    if (!client) {
      return
    }

    // Check if we have state/code returned from successful auth0 login
    const query = to?.query
    if (query && query.code && query.state) {
      // OK login, set client auth details and get targetUrl from appState
      console.log('auth mw: handle login')
      const { appState } = await client.handleRedirectCallback()
      await buildUser()
      console.log('auth mw: redirecting to', appState.targetUrl)
      return navigateTo(appState.targetUrl || '/')
    }

    // Force login
    const { loggedIn, mustReauthorize } = await checkToken()
    if (mustReauthorize) {
      console.log('auth mw: mustReauthorize')
      return navigateTo(await getAuthorizeUrl(to.fullPath), { external: true })
    }
    if (requireLogin && !loggedIn) {
      console.log('auth mw: force login')
      return navigateTo(await getAuthorizeUrl(to.fullPath), { external: true })
    }

    // Check user and data freshness
    const user = useUser()
    if (loggedIn) {
      // Recheck user every 10 minutes
      const lastChecked = Date.now() - (user?.checked || 0)
      if (lastChecked > RECHECK_INTERVAL) {
        console.log('auth mw: recheck user', 'lastChecked:', lastChecked, 'recheck interval:', RECHECK_INTERVAL)
        buildUser() // don't await
      }
    } else {
      // Clear any stale user state
      clearUser()
    }
    debugLog('auth mw: done')
  }, {
    global: true
  })
})
