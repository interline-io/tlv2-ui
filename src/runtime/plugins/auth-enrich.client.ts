import { defineNuxtPlugin, addRouteMiddleware, useState } from '#imports'
import { useUserRoles, useUserGraphqlId } from '../lib/auth/user'
import { logAuthDebug } from '../lib/util/log'
import { useApolloClient } from '@vue/apollo-composable'
import { gql } from 'graphql-tag'

const RECHECK_INTERVAL = 600_000
let lastChecked = 0

export default defineNuxtPlugin(() => {
  addRouteMiddleware('auth-enrich', async () => {
    const auth0User = useState<Record<string, any> | undefined>('auth0_user')
    if (!auth0User.value) {
      // Not logged in — clear enriched data
      const roles = useUserRoles()
      const graphqlId = useUserGraphqlId()
      roles.value = []
      graphqlId.value = ''
      lastChecked = 0
      return
    }

    // Check freshness
    const now = Date.now()
    if (lastChecked && (now - lastChecked) < RECHECK_INTERVAL) {
      return
    }

    // Fetch roles from GraphQL `me` endpoint
    try {
      logAuthDebug('auth-enrich: fetching user roles')
      const apolloClient = useApolloClient()
      const response = await apolloClient.client.query({
        query: gql`query { me { id name email roles } }`,
        fetchPolicy: 'network-only'
      })
      const meData = response.data?.me
      if (meData) {
        const roles = useUserRoles()
        const graphqlId = useUserGraphqlId()
        roles.value = meData.roles || []
        graphqlId.value = meData.id || ''
        lastChecked = now
        logAuthDebug('auth-enrich: roles loaded', meData.roles)
      }
    } catch (e) {
      logAuthDebug('auth-enrich: failed to fetch roles', e)
    }
  }, {
    global: true
  })
})
