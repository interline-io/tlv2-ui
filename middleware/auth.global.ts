import { Auth0Client } from '@auth0/auth0-spa-js'

function getAuth0Client() {
  const config = useRuntimeConfig()
  return new Auth0Client({
    domain: config.public.auth0Domain,
    clientId: config.public.auth0ClientId,
    cacheLocation: 'localstorage',
    authorizationParams: {
      redirect_uri: config.public.auth0RedirectUri,
      audience: config.public.auth0Audience,
      scope: config.public.auth0Scope
    }
  })
}

export default defineNuxtRouteMiddleware(async (to, _) => {
  if (process.server) {
    return
  }
  const auth = getAuth0Client()
  const isAuthenticated = await auth.isAuthenticated()
  if (!isAuthenticated) {
    const query = to?.query
    if (query && query.code && query.state) {
      await auth.handleRedirectCallback()
    } else {
      await auth.loginWithRedirect()
    }
    useState('user', () => { return { id: null } })
    return
  }
  const token = await auth.getTokenSilently()
  const cookie = useCookie('jwt', {
    httpOnly: true,
    sameSite: true
  })
  if (cookie.value !== token) {
    cookie.value = token
    console.log('set cookie jwt to:', token)
  }
  const user = await auth.getUser()
  useState('user', () => { return { id: user?.sub } })
})
