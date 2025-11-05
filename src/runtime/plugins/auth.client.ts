import { navigateTo, useRuntimeConfig } from '#imports'
import { defineNuxtPlugin, addRouteMiddleware } from 'nuxt/app'
import { useStorage } from '@vueuse/core'
import { gql } from 'graphql-tag'
import { configureAuth0Client, getAuth0Client, getAuthorizeUrl, checkToken } from '../lib/auth0'
import { useUser, clearUser, User, initApolloClient } from '../auth'

import { logAuthDebug } from '../lib/log'

import { useAuthHeaders } from '../composables/useAuthHeaders'
import { useApiEndpoint } from '../composables/useApiEndpoint'

const RECHECK_INTERVAL = 600_000
const buildGraphqlUser = true

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
        await buildUser()

        const targetPath = appState?.targetUrl || '/'
        logAuthDebug('auth mw: navigating to:', targetPath)
        return navigateTo(targetPath, { replace: true })
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

    // Check user data freshness
    const user = useUser()
    if (loggedIn) {
      const lastChecked = Date.now() - (user?.checked || 0)
      if (lastChecked > RECHECK_INTERVAL || !user?.id) {
        logAuthDebug('auth mw: recheck user')
        await buildUser()
      }
    } else {
      clearUser()
    }
  }, {
    global: true
  })
}
)

// Build the user from auth0 data and GraphQL me response
async function buildUser () {
  // Build user object
  const client = getAuth0Client()
  if (!client) {
    return
  }

  // Get auth0 user data
  logAuthDebug('buildUser')
  const auth0user = await client.getUser()
  if (!auth0user) {
    logAuthDebug('buildUser: missing auth0 data, clearing user')
    clearUser()
    return
  }

  logAuthDebug('buildUser: auth0 user:', auth0user)

  // Get additional user metadata from GraphQL
  let meData: any = null
  if (buildGraphqlUser) {
    try {
      const apolloClient = initApolloClient(useApiEndpoint('/query', 'default'), useAuthHeaders)
      const response = await apolloClient.query({
        query: gql`query{me{id name email external_data roles}}`
      })
      meData = response.data?.me || null
      logAuthDebug('buildUser: me graphql response:', meData)

      if (!meData) {
        logAuthDebug('buildUser: missing graphql data')
        clearUser()
        return
      }
    } catch (e) {
      logAuthDebug('buildUser: graphql failed:', e)
      clearUser()
      return
    }
  }

  // Set user state
  logAuthDebug('buildUser: set user state')
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
