import { useLocalStorage } from '@vueuse/core'
import { Auth0Client } from '@auth0/auth0-spa-js'
import { gql } from 'graphql-tag'
import { getApolloClient } from './apollo'
import { defineNuxtPlugin, addRouteMiddleware, useRuntimeConfig, navigateTo } from '#imports'

const RECHECK_INTERVAL = 600_000

class User {
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

function defaultUser() {
  return new User({})
}

export async function login() {
  console.log('auth: login')
  const authClient = getAuth0Client()
  if (authClient) {
    await authClient.loginWithRedirect()
  }
}

export async function logout() {
  console.log('auth: logout')
  const checkUser = useLocalStorage('user', defaultUser())
  checkUser.value = defaultUser()
  const authClient = getAuth0Client()
  if (authClient) {
    await authClient.logout()
  }
}

export const useUser = () => {
  const user = useLocalStorage('user', defaultUser())
  return new User(user?.value || {})
}

export const useJwt = async() => {
  let token = ''

  // Client side only
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

export default defineNuxtPlugin(() => {
  addRouteMiddleware('global-auth', async (to, _) => {
    const query = to?.query
    const authClient = getAuth0Client()
    if (authClient && query && query.code && query.state) {
      if (authClient) {
        console.log('auth mw: handle login')
        await authClient.handleRedirectCallback()
        buildUser(authClient)
        return navigateTo({
          name: 'index',
          query: {}
        })
      }
    }

    // Recheck user every 10 minutes
    const user = useUser()
    const lastChecked = Date.now() - (user?.checked || 0)
    if (authClient && user?.loggedIn && lastChecked > RECHECK_INTERVAL) {
      console.log('auth mw: recheck user')
      buildUser(authClient) // don't await
    }
  }, { global: true })
})

async function buildUser(authClient: Auth0Client) {
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

  // Save checkUser
  const checkUser = useLocalStorage('user', defaultUser())
  console.log('buildUser: set user state')
  const auth0user = await authClient.getUser()
  checkUser.value = new User({
    loggedIn: true,
    id: meData?.id || '',
    name: auth0user?.name || '',
    email: auth0user?.email || '',
    externalData: meData?.external_data || {},
    roles: meData?.roles || [],
    checked: Date.now()
  })
}

let init = false
let auth: Auth0Client

function getAuth0Client() {
  if (init) {
    return auth
  }
  if (process.server) {
    return
  }
  const config = useRuntimeConfig()
  if (!config.public.auth0ClientId) {
    console.log('no auth config')
    return
  }
  return initAuth0Client(
    String(config.public.auth0ClientId),
    String(config.public.auth0Domain),
    String(config.public.auth0RedirectUri),
    String(config.public.auth0Audience),
    String(config.public.auth0Scope)
  )
}

function initAuth0Client(
  auth0ClientId: string,
  auth0Domain: string,
  auth0RedirectUri: string,
  auth0Audience: string,
  auth0Scope: string
) {
  if (init) {
    return auth
  }
  init = true
  auth = new Auth0Client({
    domain: auth0Domain,
    clientId: auth0ClientId,
    cacheLocation: 'localstorage',
    authorizationParams: {
      redirect_uri: auth0RedirectUri,
      audience: auth0Audience,
      scope: auth0Scope
    }
  })
  return auth
}
