import { defineEventHandler } from 'h3'
// @ts-expect-error useAuth0 is added to #imports by @auth0/auth0-nuxt via addServerImportsDir
import { useAuth0, useRuntimeConfig } from '#imports'
import { enrichUserClaims } from '../../../auth/enrich'

// Fetch roles from the GraphQL `me` endpoint. Returns null if the backend
// is unreachable or returns an error — enrichment is best-effort since the
// GraphQL backend is optional.
async function fetchMeData (proxyBase: string, headers: Record<string, string>) {
  // Use fetch directly (not $fetch) to avoid the auth.server interceptor
  // which would inject duplicate auth headers
  const response = await fetch(`${proxyBase}/query`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: '{ me { id name email roles } }' })
  }).catch(() => null)
  if (!response || !response.ok) {
    console.warn('[tlv2-auth] /api/auth/session: GraphQL me query failed', response?.status ?? 'network error')
    return null
  }
  const json = await response.json()
  return json?.data?.me ?? null
}

// Returns the current user's session claims enriched with roles from the
// GraphQL `me` endpoint (if a backend is configured). Returns null if not
// logged in. Used by the client-side auth plugin to populate user state,
// especially when SSR is disabled (ssr: false).
export default defineEventHandler(async (event) => {
  const auth0 = useAuth0(event)
  const session = await auth0.getSession()
  const user = session?.user
  if (!user) {
    return null
  }

  // Enrich with roles from GraphQL `me` endpoint if backend is configured
  const config = useRuntimeConfig(event)
  const proxyBase = config.tlv2?.proxyBase?.default
  if (!proxyBase) {
    return user
  }

  const tokenSet = await auth0.getAccessToken()
  const headers: Record<string, string> = {}
  if (tokenSet.accessToken) {
    headers.Authorization = `Bearer ${tokenSet.accessToken}`
  }
  if (config.tlv2?.graphqlApikey) {
    headers.apikey = config.tlv2.graphqlApikey
  }

  const meData = await fetchMeData(proxyBase, headers)
  return enrichUserClaims(user, meData)
})
