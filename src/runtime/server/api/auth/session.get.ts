import { defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import { enrichUserClaims } from '../../../auth/enrich'
import { useAuth0Session } from '../../useSession'

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
  }).catch((e: Error) => {
    console.warn('[tlv2-auth] /api/auth/session: GraphQL me query network error:', e.message)
    return null
  })
  if (!response || !response.ok) {
    if (response) {
      console.warn('[tlv2-auth] /api/auth/session: GraphQL me query returned', response.status)
    }
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
  const auth = await useAuth0Session(event)
  if (!auth.loggedIn || !auth.user) {
    return null
  }

  // Enrich with roles from GraphQL `me` endpoint if backend is configured
  const config = useRuntimeConfig(event)
  const proxyBase = config.tlv2?.proxyBase?.default
  if (!proxyBase) {
    return auth.user
  }

  const headers: Record<string, string> = {}
  if (auth.accessToken) {
    headers.Authorization = `Bearer ${auth.accessToken}`
  }
  if (config.tlv2?.graphqlApikey) {
    headers.apikey = config.tlv2.graphqlApikey
  }

  const meData = await fetchMeData(proxyBase, headers)
  return enrichUserClaims(auth.user, meData)
})
