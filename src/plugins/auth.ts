import { defineNuxtPlugin, addRouteMiddleware, useCookie, useRuntimeConfig } from '#app'
import { useLocalStorage } from '@vueuse/core'
import { Auth0Client } from '@auth0/auth0-spa-js'
import gql from 'graphql-tag'
import { getApolloClient } from './apollo'

export async function login() {
  console.log('auth: login')
  const a = getAuth0Client()
  if (!a) {
    return
  }
  await a.loginWithRedirect()
  await checkLogin()
}

export async function logout() {
  console.log('auth: logout')
  const checkUser = useLocalStorage('user', defaultUser())
  checkUser.value = defaultUser()
  const cookie = useCookie('jwt')
  cookie.value = null

  const a = getAuth0Client()
  if (!a || !a.isAuthenticated) {
    return
  }
  await a.logout()
}

export const useJwt = () => {
  const cookie = useCookie('jwt')
  if (cookie && cookie.value) {
    return cookie.value
  }
  return ''
}

export const useUser = () => {
  return useLocalStorage('user', defaultUser())
}

export default defineNuxtPlugin(() => {
  addRouteMiddleware('global-auth', async (to, _) => {
    const query = to?.query
    if (query && query.code && query.state) {
      const a = getAuth0Client()
      if (a) {
        await a.handleRedirectCallback()
        await checkLogin()
        return navigateTo({
          name: 'index',
          query: {}
        })
      }
    }
  }, { global: true })
})

function defaultUser() {
  return {
    loggedIn: false,
    id: '',
    name: '',
    email: '',
    externalData: {}
  }
}

async function checkLogin() {
  console.log('checkLogin')
  // Already logged in...
  const checkUser = useLocalStorage('user', defaultUser())
  if (checkUser?.value?.id) {
    console.log('checkLogin: user present', checkUser.value)
    return checkUser.value
  }

  // Get auth0
  console.log('checkLogin: get client')
  const a = getAuth0Client()
  if (!a) {
    return checkUser.value
  }

  // If not authenticated, nothing to return
  console.log('checkLogin: await authenticated')
  const isAuthenticated = await auth.isAuthenticated()
  if (!isAuthenticated) {
    return checkUser.value
  }

  // Get JWT
  console.log('checkLogin: await token')
  const token = await auth.getTokenSilently()

  // Set JWT as cookie for SSR
  console.log('checkLogin: set cookie')
  const cookie = useCookie('jwt', { sameSite: 'lax' })
  cookie.value = token

  // Build user object
  // Get additional user metadata from GraphQL
  console.log('checkLogin: await me response')
  const apolloClient = getApolloClient(token)
  const meData = await apolloClient.query({
    query: gql`query{me{id name email external_data}}`
  }).then((data) => {
    console.log('checkLogin: me graphql response:', data.data.me)
    return data.data.me
  })

  // Save checkUser
  console.log('checkLogin: set user state')
  const auth0user = await auth.getUser()
  checkUser.value = {
    loggedIn: true,
    id: meData?.id || '',
    name: auth0user?.name || '',
    email: auth0user?.email || '',
    externalData: meData?.external_data || {}
  }
  return checkUser.value
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
    authorizationParams: {
      redirect_uri: config.public.auth0RedirectUri,
      audience: config.public.auth0Audience,
      scope: config.public.auth0Scope
    }
  })
  return auth
}
