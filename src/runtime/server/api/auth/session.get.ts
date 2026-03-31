import { defineEventHandler } from 'h3'

// Returns the current user's session claims enriched with roles from the
// GraphQL `me` endpoint (if a backend is configured). Returns null if not
// logged in. Used by the client-side auth plugin to populate user state,
// especially when SSR is disabled (ssr: false).
export default defineEventHandler(async (event) => {
  try {
    const { useAuth0, useRuntimeConfig } = await import('#imports') as any
    const auth0 = useAuth0(event)
    const session = await auth0.getSession()
    const user = session?.user
    if (!user) {
      return null
    }

    // Enrich with roles from GraphQL `me` endpoint if backend is configured
    const config = useRuntimeConfig(event)
    const proxyBase = config.tlv2?.proxyBase?.default
    if (proxyBase) {
      try {
        const tokenSet = await auth0.getAccessToken()
        const headers: Record<string, string> = {}
        if (tokenSet.accessToken) {
          headers.Authorization = `Bearer ${tokenSet.accessToken}`
        }
        if (config.tlv2?.graphqlApikey) {
          headers.apikey = config.tlv2.graphqlApikey
        }
        // Use fetch directly (not $fetch) to avoid the auth.server interceptor
        // which would inject duplicate auth headers
        const meResponse = await fetch(`${proxyBase}/query`, {
          method: 'POST',
          headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: '{ me { id name email roles } }' })
        })
        const meJson = await meResponse.json()
        const meData = meJson?.data?.me
        if (meData) {
          return {
            ...user,
            tlv2_id: meData.id || '',
            tlv2_name: meData.name || '',
            tlv2_email: meData.email || '',
            tlv2_roles: meData.roles || []
          }
        }
      } catch (e) {
        console.warn('[tlv2-auth] /api/auth/session: GraphQL me query failed:', e)
      }
    }

    return user
  } catch (e) {
    console.warn('[tlv2-auth] /api/auth/session failed:', e)
    return null
  }
})
