import { defineNuxtPlugin, addRouteMiddleware, useState } from '#imports'
import { useUserRoles, useUserGraphqlId } from './useUser'
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

    // Fetch enriched session data from server
    try {
      logAuthDebug('auth-enrich: fetching session from /api/auth/session')
      const session = await $fetch('/api/auth/session')
      auth0User.value = session || undefined
    } catch (e) {
      console.warn('[tlv2-auth] Failed to fetch session:', e)
    }

    if (!auth0User.value) {
      // Not logged in — clear enriched data
      const roles = useUserRoles()
      const graphqlId = useUserGraphqlId()
      roles.value = []
      graphqlId.value = ''
      lastChecked = 0
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
