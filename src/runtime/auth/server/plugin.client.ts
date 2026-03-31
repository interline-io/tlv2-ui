import { defineNuxtPlugin, addRouteMiddleware, useState } from '#imports'
import { useUserRoles, useUserGraphqlId } from './useUser'
import { logAuthDebug } from '../../lib/util/log'

const RECHECK_INTERVAL = 600_000
let lastChecked = 0

export default defineNuxtPlugin(() => {
  addRouteMiddleware('auth-enrich', async () => {
    const auth0User = useState<Record<string, any> | undefined>('auth0_user')

    // If auth0_user is not populated (e.g., ssr: false), fetch from server endpoint
    if (auth0User.value === undefined) {
      try {
        logAuthDebug('auth-enrich: fetching session from /api/auth/session')
        const session = await $fetch('/api/auth/session')
        if (session) {
          auth0User.value = session
        }
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
      return
    }

    // Check freshness — roles come from the session endpoint
    const now = Date.now()
    if (lastChecked && (now - lastChecked) < RECHECK_INTERVAL) {
      return
    }

    // Populate roles from session response (enriched server-side)
    const roles = useUserRoles()
    const graphqlId = useUserGraphqlId()
    if (auth0User.value.tlv2_roles) {
      roles.value = [...auth0User.value.tlv2_roles].sort()
      graphqlId.value = auth0User.value.tlv2_id || ''
      lastChecked = now
      logAuthDebug('auth-enrich: roles loaded from session', roles.value)
    } else if (!lastChecked) {
      // SSR-populated user without enrichment — fetch from session endpoint
      try {
        logAuthDebug('auth-enrich: re-fetching session for roles')
        const session = await $fetch('/api/auth/session')
        if (session && (session as any).tlv2_roles) {
          auth0User.value = session as any
          roles.value = [...((session as any).tlv2_roles || [])].sort()
          graphqlId.value = (session as any).tlv2_id || ''
          lastChecked = now
          logAuthDebug('auth-enrich: roles loaded', roles.value)
        }
      } catch (e) {
        console.warn('[tlv2-auth] Failed to fetch enriched session:', e)
      }
    }
  }, {
    global: true
  })
})
