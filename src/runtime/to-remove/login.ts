import { navigateTo, useRuntimeConfig, useRoute, addRouteMiddleware } from '#imports'
import { createMixpanel } from '../lib/mixpanel'
import { gql } from 'graphql-tag'
import { useStorage } from '@vueuse/core'
import { configureAuth0Client, getAuth0Client, getAuthorizeUrl, getLogoutUrl, checkToken } from '../lib/auth0'
import { getApolloClient } from '../auth/apollo'
import { debugLog } from '../lib/log'
import { User } from '../auth/user'
import { useUser, clearUser } from '../auth/auth'

const RECHECK_INTERVAL = 600_000
const buildGraphqlUser = true
const logoutUri = '/'

// Login
export const useLogin = async (targetUrl: null | string) => {
  debugLog('useLogin')
  // Get current route's full path if no targetUrl provided
  const route = useRoute()
  targetUrl = targetUrl || route.fullPath
  debugLog('useLogin with targetUrl:', targetUrl)
  return navigateTo(await getAuthorizeUrl(targetUrl), { external: true })
}

// Logout
export const useLogout = async () => {
  debugLog('useLogout')
  // Reset Mixpanel before redirecting
  const config = useRuntimeConfig()
  const mixpanel = createMixpanel(config.public.tlv2?.mixpanelApikey, await useUser())
  mixpanel.reset()
  return navigateTo(await getLogoutUrl(logoutUri), { external: true })
}

/// ////////////////////
// User
/// ////////////////////

/////////////////////

// Build the user from auth0 data and GraphQL me response
async function buildUser () {
  // Build user object
  const client = getAuth0Client()
  if (!client) {
    return
  }

  // Get auth0 user data
  debugLog('buildUser')
  const auth0user = await client.getUser()
  if (!auth0user) {
    debugLog('buildUser: missing auth0 data, clearing user')
    clearUser()
    return
  }

  debugLog('buildUser: auth0 user:', auth0user)

  // Get additional user metadata from GraphQL
  let meData: any = null
  if (buildGraphqlUser) {
    try {
      const apolloClient = await getApolloClient()
      const response = await apolloClient.query({
        query: gql`query{me{id name email external_data roles}}`
      })
      meData = response.data?.me || null
      debugLog('buildUser: me graphql response:', meData)

      if (!meData) {
        debugLog('buildUser: missing graphql data')
        clearUser()
        return
      }
    } catch (e) {
      debugLog('buildUser: graphql failed:', e)
      clearUser()
      return
    }
  }

  // Set user state
  debugLog('buildUser: set user state')
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
}

export const defineAuthPlugin = () => {
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
    const requireLogin = !!config.public.tlv2?.requireLogin
    if (mustReauthorize || (requireLogin && !loggedIn)) {
      debugLog('auth mw: need auth')
      clearUser()
      return navigateTo(await getAuthorizeUrl(to.fullPath), { external: true })
    }

    // Check user data freshness
    const user = await useUser()
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
}
