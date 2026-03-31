import { defineNuxtPlugin, addRouteMiddleware, useState, useRuntimeConfig } from '#imports'
import { useUserRoles, useUserGraphqlId } from './useUser'
import { useLogin } from './useLogin'
import { logAuthDebug } from '../../lib/util/log'

const RECHECK_INTERVAL = 600_000
let lastChecked = 0

export default defineNuxtPlugin(() => {
  addRouteMiddleware('auth-enrich', async () => {
    const auth0User = useState<Record<string, any> | undefined>('auth0_user')

    // Check freshness — skip if recently checked
    const now = Date.now()
    if (lastChecked && (now - lastChecked) < RECHECK_INTERVAL) {
      return
    }

    // On first client-side run, if auth0-nuxt already populated auth0_user
    // during SSR but without roles, we still need to fetch the session
    // endpoint to get roles. However, if auth0_user already has tlv2_roles
    // (e.g. from a prior enrichment that survived hydration), skip the fetch.
    const needsFetch = !auth0User.value || !auth0User.value.tlv2_roles
    if (needsFetch) {
      try {
        logAuthDebug('auth-enrich: fetching session from /api/auth/session')
        const session = await $fetch('/api/auth/session')
        auth0User.value = session || undefined
      } catch (e) {
        console.warn('[tlv2-auth] Failed to fetch session:', e)
      }
    }

    if (!auth0User.value) {
      // Not logged in — clear enriched data
      const roles = useUserRoles()
      const graphqlId = useUserGraphqlId()
      roles.value = []
      graphqlId.value = ''
      lastChecked = 0

      // Redirect to login if requireLogin is set
      const config = useRuntimeConfig()
      if (config.public.tlv2?.requireLogin) {
        logAuthDebug('auth-enrich: requireLogin — redirecting to login')
        return useLogin(null)
      }
      return
    }

    // Populate roles from session response (enriched server-side)
    const roles = useUserRoles()
    const graphqlId = useUserGraphqlId()
    roles.value = [...(auth0User.value.tlv2_roles || [])].sort()
    graphqlId.value = auth0User.value.tlv2_id || ''
    lastChecked = Date.now()
    logAuthDebug('auth-enrich: roles loaded', roles.value)
  }, {
    global: true
  })
})
