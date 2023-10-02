import { defineNuxtPlugin, addRouteMiddleware, useCookie, useRuntimeConfig } from '#app'
import { Auth0Client } from '@auth0/auth0-spa-js'
// import gql from 'graphql-tag'
// import { getApolloClient } from './apollo'

let init = false
let auth: Auth0Client

export function getAuth0Client() {
  if (process.server) {
    return
  }
  if (init) {
    return auth
  }
  init = true
  const config = useRuntimeConfig()
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

export async function getJwt() {
  const cookie = useCookie('jwt')
  if (cookie && cookie.value) {
    return cookie.value
  }
  const a = getAuth0Client()
  if (!a) {
    return ''
  }
  const isAuthenticated = await auth.isAuthenticated()
  // console.log('getJwt isAuthenticated:', isAuthenticated)
  if (!isAuthenticated) {
    return ''
  }
  const token = await auth.getTokenSilently()
  // console.log('getJwt token:', token)
  return token
}

export async function handleRedirectCallback() {
  const a = getAuth0Client()
  if (!a) {
    return
  }
  console.log('auth handleRedirectCallback()')
  await a.handleRedirectCallback()
}

export async function login() {
  const a = getAuth0Client()
  if (!a) {
    return
  }
  console.log('auth loginWithRedirect()')
  await a.loginWithRedirect()
}

export async function logout() {
  const a = getAuth0Client()
  if (!a || !a.isAuthenticated) {
    return
  }
  console.log('auth logout()')
  await a.logout()
}

export async function checkLogin() {
  // console.log('checkLogin')
  // const a = getAuth0Client()
  // if (!a) {
  //   return
  // }
  // const isAuthenticated = await auth.isAuthenticated()
  // if (!isAuthenticated) {
  //   return
  // }
  // const token = await auth.getTokenSilently()
  // const cookie = useCookie('jwt', {
  //   // httpOnly: true
  //   // sameSite: true
  // })
  // if (cookie.value !== token) {
  //   cookie.value = token
  //   // console.log('set cookie jwt to:', token)
  // }

  // const apolloClient = getApolloClient(token)
  // const meData = await apolloClient.query({
  //   query: gql`query{me{id name email external_data}}`
  // }).then((data) => {
  //   console.log('me graphql response:', data.data.me)
  //   return data.data.me
  // })
  // console.log('externalData:', meData.external_data)

  // const user = await auth.getUser()
  // console.log('user:', user)
  // useState('user', () => {
  //   return {
  //     id: user?.email,
  //     name: user?.name,
  //     email: user?.email,
  //     externalData: meData?.external_data
  //   }
  // })
}

export default defineNuxtPlugin(() => {
  addRouteMiddleware('global-auth', async (to, _) => {
    const query = to?.query
    if (query && query.code && query.state) {
      await handleRedirectCallback()
    }
    await checkLogin()
  }, { global: true })
})
