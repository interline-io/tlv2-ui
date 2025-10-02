import { useRuntimeConfig, navigateTo, addRouteMiddleware } from '#imports'
import { gql } from 'graphql-tag'
import { useStorage } from '@vueuse/core'
import { configureAuth0Client, getAuth0Client, getAuthorizeUrl, checkToken } from '../lib/auth0'
import { getApolloClient } from './apollo'
import { debugLog } from '../lib/log'

const RECHECK_INTERVAL = 600_000
const buildGraphqlUser = true

export class User {
  loggedIn = false
  id = ''
  name = ''
  email = ''
  roles = []
  externalData = {}
  checked = 0
  constructor (v: any) {
    Object.assign(this, v)
  }

  hasRole (v: string): boolean {
    for (const s of this.roles) {
      if (s === v) {
        return true
      }
    }
    return false
  }
}

export function clearUser () {
  const checkUser = useStorage('user', {})
  checkUser.value = new User({ loggedIn: false })
}

export const useUser = () => {
  const user = useStorage('user', {})
  return new User(user?.value || {})
}

// Build the user from auth0 data and GraphQL me response
export async function buildUser () {
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
  debugLog('auth plugin: start')
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
}
