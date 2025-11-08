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
        logAuthDebug('auth mw: got appState:', appState)

        // Set cookie for SSR authentication
        await setAuthCookie()

        const targetPath = appState?.targetUrl || '/'
        logAuthDebug('auth mw: navigating to:', targetPath)
        // Force full page reload to reinitialize Apollo client with new credentials
        return navigateTo(targetPath, { external: true })
      } catch (e) {
        logAuthDebug('auth mw: handleRedirectCallback failed:', e)
        clearUser()
        return navigateTo(await getAuthorizeUrl(to.fullPath), { external: true })
      }
    }

    // Check token state
    const { loggedIn, mustReauthorize } = await checkToken()
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
  }, {
    global: true
  })
}
)

// Set auth cookie after successful Auth0 login
async function setAuthCookie () {
  const { token } = await checkToken()
  if (token) {
    logAuthDebug('setAuthCookie: setting auth cookie for SSR')
    const authCookie = useCookie('auth-token', {
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    })
    authCookie.value = token
  }
}
