import { Auth0Client } from '@auth0/auth0-spa-js'
import { logAuthDebug } from '../lib/log'
import { log } from 'console'

/// ////////////////////
// Auth0 client initialization
/// ////////////////////

const RECHECK_INTERVAL = 600_000

// Auth0 client init
let authInit = false
let authClient: Auth0Client
let logoutUri = '/'

export interface Auth0Options {
  auth0ClientId?: string
  auth0Domain?: string
  auth0Audience?: string
  auth0Scope?: string
  auth0RedirectUri?: string
  auth0LogoutUri?: string
}

export function configureAuth0Client (options: Auth0Options): Auth0Client | null {
  if (authInit) {
    return authClient
  }
  authInit = true
  if (process.server) {
    return
  }

  // Check if we are configured correctly
  if (options.auth0ClientId) {
    // Update global config
    logoutUri = String(options.auth0LogoutUri || window?.location?.origin || '/')

    const scope = String(options.auth0Scope)
    logAuthDebug('auth0 init:', { scope })

    // Create and return global auth0 client
    authClient = new Auth0Client({
      domain: String(options.auth0Domain),
      clientId: String(options.auth0ClientId),
      cacheLocation: 'localstorage',
      useRefreshTokens: false, // Use iframe method for token refresh
      authorizationParams: {
        redirect_uri: String(options.auth0RedirectUri || window?.location?.origin || '/'),
        audience: String(options.auth0Audience),
        scope: scope
      }
    })
  }

  // Set as initialized
  // (even if not available, to avoid future runtime config check)
  return authClient
}

// Client MUST be configured
export function getAuth0Client (): Auth0Client | null {
  if (!authInit) {
    logAuthDebug('getAuth0Client called before client configured')
    return null
  }
  return authClient
}

// Check the client token, return { token, loggedIn, mustReauthorize }
// mustReauthorize will be set to true if a user is logged in but token fails
export async function checkToken () {
  let token = ''
  let loggedIn = false
  let mustReauthorize = false
  const client = getAuth0Client()
  if (!client) {
    logAuthDebug('checkToken: no client')
    return { token, loggedIn, mustReauthorize }
  }

  try {
    // First check if we're authenticated
    loggedIn = await client.isAuthenticated()
    if (!loggedIn) {
      logAuthDebug('checkToken: not logged in')
      return { token, loggedIn, mustReauthorize }
    }

    // Get a fresh token
    const tokenResponse = await client.getTokenSilently({ detailedResponse: true })
    token = tokenResponse.access_token
    loggedIn = true
  } catch (error: any) {
    logAuthDebug('checkToken: error:', error)
    if (error.error === 'login_required') {
      mustReauthorize = true
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
export async function getLogoutUrl (): Promise<string> {
  const client = getAuth0Client()
  if (!client) {
    return logoutUri
  }
  let authorizationUrl = ''
  await client.logout({
    logoutParams: {
      returnTo: logoutUri
    },
    openUrl (url) {
      authorizationUrl = url
    }
  })
  return authorizationUrl
}
