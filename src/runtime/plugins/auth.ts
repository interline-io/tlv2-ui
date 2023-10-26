import { useLocalStorage } from '@vueuse/core'
import { Auth0Client } from '@auth0/auth0-spa-js'
import gql from 'graphql-tag'
import { getApolloClient } from './apollo'
import { defineNuxtPlugin, addRouteMiddleware, useCookie, useRuntimeConfig, navigateTo } from '#app'

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
  const cookie = useCookie('jwt')
  cookie.value = null
  const authClient = getAuth0Client()
  if (authClient) {
    await authClient.logout()
  }
}

export const useUser = () => {
  return useLocalStorage('user', defaultUser())
}

export const useJwt = async() => {
  const cookie = useCookie('jwt')
  let token = cookie.value || ''

  // Client side only
  const authClient = getAuth0Client()
  if (authClient && await authClient.isAuthenticated()) {
    try {
      token = await authClient.getTokenSilently()
    } catch (error) {
      console.log('useJwt: error in getTokenSilently; log in again')
      await login()
    }
    if (cookie && cookie.value !== token) {
      console.log('useJwt: set cookie')
      cookie.value = token
    }
  }
  // console.log('useJwt: return', token)
  return token
}

export default defineNuxtPlugin(() => {
  addRouteMiddleware('global-auth', async (to, _) => {
    const query = to?.query
    if (query && query.code && query.state) {
      const authClient = getAuth0Client()
      if (authClient) {
        await authClient.handleRedirectCallback()
        await useJwt()
        await buildUser(authClient)
        return navigateTo({
          name: 'index',
          query: {}
        })
      }
    }
  }, { global: true })
})

async function buildUser(authClient: Auth0Client) {
  // Build user object
  // Get additional user metadata from GraphQL
  console.log('buildUser: await me response')
  const apolloClient = getApolloClient()
  const meData = await apolloClient.query({
    query: gql`query{me{id name email external_data}}`
  }).then((data) => {
    console.log('buildUser: me graphql response:', data.data.me)
    return data.data.me
  })

  // Save checkUser
  const checkUser = useLocalStorage('user', defaultUser())
  console.log('buildUser: set user state')
  const auth0user = await authClient.getUser()
  checkUser.value = {
    loggedIn: true,
    id: meData?.id || '',
    name: auth0user?.name || '',
    email: auth0user?.email || '',
    externalData: meData?.external_data || {}
  }
}

function defaultUser() {
  return {
    loggedIn: false,
    id: '',
    name: '',
    email: '',
    externalData: {}
  }
}

let init = false
let auth: Auth0Client

function getAuth0Client() {
  if (process.server) {
    return
  }
  if (init) {
    return auth
  }
  const config = useRuntimeConfig()
  init = true
  auth = new Auth0Client({
    domain: config.public.auth0Domain,
    clientId: config.public.auth0ClientId,
    cacheLocation: 'localstorage',
    // useRefreshTokens: true,
    authorizationParams: {
      redirect_uri: config.public.auth0RedirectUri,
      audience: config.public.auth0Audience,
      scope: config.public.auth0Scope
    }
  })
  return auth
}
