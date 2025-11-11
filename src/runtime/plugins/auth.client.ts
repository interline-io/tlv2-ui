import { navigateTo, useRuntimeConfig, useCookie } from '#imports'
import { defineNuxtPlugin, addRouteMiddleware } from 'nuxt/app'
import { configureAuth0Client, getAuthorizeUrl, checkToken } from '../lib/auth0'
import { clearUser } from '../composables/useUser'
import { logAuthDebug } from '../lib/log'

export default defineNuxtPlugin(() => {
  logAuthDebug('auth plugin: start')
  // Check if client is configured
  const config = useRuntimeConfig()
  const client = configureAuth0Client(config.public.tlv2 || {})
  if (!client) {
    return
  }

  addRouteMiddleware('global-auth', async (to, _) => {
    // Handle auth0 redirect callback
    const query = to?.query
    if (query && query.code && query.state) {
      try {
        logAuthDebug('auth mw: handle login')
        const { appState } = await client.handleRedirectCallback()
        const targetPath = appState?.targetUrl || '/'
        logAuthDebug('auth mw: got appState:', appState)

        // Set cookie for SSR authentication
        const { token } = await checkToken()
        setAuthCookie(token)

        // Force full page reload to reinitialize Apollo client with new credentials
        logAuthDebug('auth mw: navigating to:', targetPath)
        return navigateTo(targetPath, { external: true })
      } catch (e) {
        logAuthDebug('auth mw: handleRedirectCallback failed:', e)
        clearUser()
        return navigateTo(await getAuthorizeUrl(to.fullPath), { external: true })
      }
    }

    // Check token state
    const { token, loggedIn, mustReauthorize } = await checkToken()
    const requireLogin = !!config.public.tlv2?.requireLogin
    if (mustReauthorize || (requireLogin && !loggedIn)) {
      logAuthDebug('auth mw: need auth')
      clearUser()
      return navigateTo(await getAuthorizeUrl(to.fullPath), { external: true })
    }

    // Clear user if not logged in
    if (!loggedIn) {
      clearUser()
    }

    // Refresh auth cookie
    setAuthCookie(token)
  }, {
    global: true
  })
}
)

// Set auth cookie after successful Auth0 login
function setAuthCookie (token: string) {
  logAuthDebug('setAuthCookie: setting auth cookie for SSR')
  useCookie('auth-token', {
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
    default: () => ({ token }),
    watch: false,
  })
}
