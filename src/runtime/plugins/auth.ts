import { Auth0Client } from '@auth0/auth0-spa-js'
import { useStorage } from '@vueuse/core'
import { gql } from 'graphql-tag'
import { getApolloClient } from './apollo'
import { defineNuxtPlugin, addRouteMiddleware, navigateTo, useRuntimeConfig } from '#imports'

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
  return authClient
}

// JWT
export const useJwt = async() => {
  const { token, mustReauthorize } = await checkToken()
  if (mustReauthorize) {
    await useLogin(window?.location?.toString() || '/')
  }
  return token
}

export const useUser = () => {
  const user = useStorage('user', {})
  return new User(user?.value || {})
}

// Login
export const useLogin = async(targetUrl: null | string) => {
  console.log('auth: login')
  return navigateTo(await getAuthorizeUrl(targetUrl), { external: true })
}

// Logout
export const useLogout = async() => {
  console.log('auth: logout')
  return navigateTo(await getLogoutUrl(logoutUri), { external: true })
}

// User
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

// Build the user from auth0 data and GraphQL me response
async function buildUser() {
  // Build user object
  // Get additional user metadata from GraphQL
  console.log('buildUser: await me response')
  const apolloClient = getApolloClient()
  const meData = await apolloClient.query({
    query: gql`query{me{id name email external_data roles}}`
  }).then((data) => {
    console.log('buildUser: me graphql response:', data.data.me)
    return data.data.me
  })

  // Set user state
  console.log('buildUser: set user state')
  const client = getAuth0Client()
  if (!client) {
    return
  }
  const auth0user = await client.getUser()
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
  console.log('buildUser: result:', builtUser)
}

// Check the client token, return { token, loggedIn, mustReauthorize }
// mustReauthorize will be set to true if a user is logged in but token fails
async function checkToken() {
  let token = ''
  let loggedIn = false
  let mustReauthorize = false
  const client = getAuth0Client()
  if (!client) {
    return { token, loggedIn, mustReauthorize }
  }
  if (await client.isAuthenticated()) {
    loggedIn = true
    try {
      // Everything is OK
      token = await client.getTokenSilently()
    } catch (error) {
      // Invalid token
      console.log('useJwt: error in getTokenSilently; must authorize again')
      mustReauthorize = true
    }
  }
  return { token, loggedIn, mustReauthorize }
}

// Get an auth0 /authorize url that also includes targetUrl in app state
async function getAuthorizeUrl(targetUrl: null | string): Promise<string> {
  targetUrl = targetUrl || '/'
  const client = getAuth0Client()
  if (!client) {
    return targetUrl
  }
  let authorizationUrl = ''
  await client.loginWithRedirect({
    appState: { targetUrl },
    openUrl(url) { authorizationUrl = url }
  })
  return authorizationUrl
}

// Get an auth0 logout url
async function getLogoutUrl(targetUrl: null | string): Promise<string> {
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
    openUrl(url) { authorizationUrl = url }
  })
  return authorizationUrl
}

export default defineNuxtPlugin(() => {
  addRouteMiddleware('global-auth', async (to, _) => {
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
      return navigateTo(appState.targetUrl)
    }

    // Force login
    const { loggedIn, mustReauthorize } = await checkToken()
    if (requireLogin && (!loggedIn || mustReauthorize)) {
      console.log('auth mw: force login')
      return navigateTo(await getAuthorizeUrl(to.fullPath), { external: true })
    }

    // Check user and the last time the user was checked
    const user = useUser()
    const lastChecked = Date.now() - (user?.checked || 0)

    // Recheck user every 10 minutes
    if (user?.loggedIn && lastChecked > RECHECK_INTERVAL) {
      console.log('auth mw: recheck user', 'lastChecked:', lastChecked, 'recheck interval:', RECHECK_INTERVAL)
      buildUser() // don't await
    }
  }, {
    global: true
  })
})
