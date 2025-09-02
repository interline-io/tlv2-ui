import { useRuntimeConfig } from '#imports'
import { Auth0Client } from '@auth0/auth0-spa-js'

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
