import {
  defineNuxtPlugin,
  addRouteMiddleware,
  useRuntimeConfig,
  navigateTo
} from '#imports'

import {
  useUser,
  getAuth0Client,
  buildUser,
  getAuthorizeUrl,
  checkToken,
  clearUser
} from '../libnuxt/user.client'

/// ////////////////////
// Middleware
/// ////////////////////

const RECHECK_INTERVAL = 600_000

export default defineNuxtPlugin(() => {
  addRouteMiddleware('global-auth', async (to, _) => {
    // Check if client is configured
    const client = getAuth0Client()
    if (!client) {
      return
    }
    const config = useRuntimeConfig()
    const requireLogin = !!config.public.requireLogin

    // Handle auth0 redirect callback
    const query = to?.query
    if (query && query.code && query.state) {
      try {
        debugLog('auth mw: handle login')
        const { appState } = await client.handleRedirectCallback()
        debugLog('auth mw: got appState:', appState)
        await buildUser()

        const targetPath = appState?.targetUrl || '/'
        debugLog('auth mw: navigating to:', targetPath)
        return navigateTo(targetPath, { replace: true })
      } catch (e) {
        debugLog('auth mw: handleRedirectCallback failed:', e)
        clearUser()
        return navigateTo(await getAuthorizeUrl(to.fullPath), { external: true })
      }
    }

    // Check token state
    const { loggedIn, mustReauthorize } = await checkToken()

    if (mustReauthorize || (requireLogin && !loggedIn)) {
      debugLog('auth mw: need auth')
      return navigateTo(await getAuthorizeUrl(to.fullPath), { external: true })
    }

    // Check user data freshness
    const user = useUser()
    if (loggedIn) {
      const lastChecked = Date.now() - (user?.checked || 0)
      if (lastChecked > RECHECK_INTERVAL || !user?.id) {
        debugLog('auth mw: recheck user')
        await buildUser()
      }
    } else {
      clearUser()
    }
  }, {
    global: true
  })
})

function debugLog (msg: string, ...args: any) {
  console.log(msg, ...args)
}
