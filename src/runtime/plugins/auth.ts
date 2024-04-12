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

export function getAuth0Client() {
  if (authInit) {
    return authClient
  }
  if (process.server) {
    return
  }
  const config = useRuntimeConfig()
  const redirectUri = config.public.auth0RedirectUri || window?.location?.origin || '/'
  return initAuth0Client(
    config.public.requireLogin,
    config.public.auth0ClientId,
    config.public.auth0Domain,
    redirectUri,
    config.public.auth0Audience,
    config.public.auth0Scope
  )
}

export function initAuth0Client(
  requireLoginA: boolean,
  auth0ClientId: string,
  auth0Domain: string,
  auth0RedirectUri: string,
  auth0Audience: string,
  auth0Scope: string
) {
  authInit = true
  requireLogin = requireLoginA
  authClient = new Auth0Client({
    domain: auth0Domain,
    clientId: auth0ClientId,
    cacheLocation: 'localstorage',
    authorizationParams: {
      redirect_uri: auth0RedirectUri,
      audience: auth0Audience,
      scope: auth0Scope
    }
  })
  return authClient
}

// JWT
export const useJwt = async() => {
  // Client side only
  let token = ''
  const authClient = getAuth0Client()
  if (authClient && await authClient.isAuthenticated()) {
    try {
      token = await authClient.getTokenSilently()
    } catch (error) {
      console.log('useJwt: error in getTokenSilently; log in again')
      login()
    }
  }
  // console.log('useJwt: return', token)
  return token
}

// Login, logout
export async function login() {
  console.log('auth: login')
  const authClient = getAuth0Client()
  if (authClient) {
    await authClient.loginWithRedirect()
  }
}

export async function logout() {
  console.log('auth: logout')
  const checkUser = useStorage('user', {})
  checkUser.value = {}
  const authClient = getAuth0Client()
  if (authClient) {
    await authClient.logout()
  }
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

export const useUser = () => {
  const user = useStorage('user', {})
  return new User(user?.value || {})
}

export const useLogout = () => {
  return logout()
}

export const useLogin = () => {
  return login()
}

async function setUser (data: User) {
  console.log('buildUser: set user state')
  const checkUser = useStorage('user', {})
  const auth0user = await authClient.getUser()
  checkUser.value = new User({
    loggedIn: true,
    id: data?.id,
    name: auth0user?.name || '',
    email: auth0user?.email || '',
    externalData: data?.externalData || {},
    roles: data?.roles || [],
    checked: Date.now()
  })
}

export async function buildUser() {
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

  // // Save checkUser
  await setUser(new User({
    id: meData?.id || '',
    externalData: meData?.external_data || {},
    roles: meData?.roles || []
  }))
}

export default defineNuxtPlugin(() => {
  addRouteMiddleware('global-auth', async (to, _) => {
    const query = to?.query
    const authClient = getAuth0Client()
    if (authClient && query && query.code && query.state) {
      if (authClient) {
        console.log('auth mw: handle login')
        await authClient.handleRedirectCallback()
        await buildUser()
        return navigateTo({
          name: 'index',
          query: {}
        })
      }
    }

    // Check user
    const user = useUser()
    const lastChecked = Date.now() - (user?.checked || 0)

    // Force login
    if (authClient && requireLogin && user && !user.loggedIn) {
      console.log('auth mw: force login')
      await login()
    }

    // Recheck user every 10 minutes
    if (authClient && user?.loggedIn && lastChecked > RECHECK_INTERVAL) {
      console.log('auth mw: recheck user', 'lastChecked:', lastChecked, 'recheck interval:', RECHECK_INTERVAL)
      buildUser() // don't await
    }
  }, {
    global: true
  })
})
