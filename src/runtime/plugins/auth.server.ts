import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { useAuth0Session } from '../server/useSession'

// Server-side auth header injection for SSR requests.
// Overrides globalThis.$fetch and globalThis.fetch to inject the user's JWT
// and API key so that SSR data fetching has the same auth context as the
// original request. This covers both ofetch ($fetch/useFetch) and native
// fetch (used by Apollo's createUploadLink).
//
// Only injects headers on requests to configured proxyBase origins to avoid
// leaking credentials to third-party services.
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const graphqlApikey = config.tlv2?.graphqlApikey || ''

  // Collect all configured backend origins
  const proxyBases: Record<string, string> = config.tlv2?.proxyBase || {}
  const allowedOrigins = Object.values(proxyBases)
    .filter(Boolean)
    .map((base) => {
      const s = String(base)
      if (!s.startsWith('http://') && !s.startsWith('https://')) { return '' }
      return new URL(s).origin
    })
    .filter(Boolean)

  function isBackendRequest (url: string): boolean {
    if (!url.startsWith('http://') && !url.startsWith('https://')) { return false }
    return allowedOrigins.includes(new URL(url).origin)
  }

  function getAuthHeaders (): Record<string, string> {
    const headers: Record<string, string> = {}
    if (graphqlApikey) {
      headers.apikey = graphqlApikey
    }
    const event = nuxtApp.ssrContext?.event
    if (event) {
      const auth = useAuth0Session(event)
      if (auth.accessToken) {
        headers.Authorization = `Bearer ${auth.accessToken}`
      }
    }
    return headers
  }

  // Override $fetch (ofetch) — covers useFetch, $fetch, fetchAdmin, etc.
  globalThis.$fetch = globalThis.$fetch.create({
    onRequest ({ request, options }) {
      const url = typeof request === 'string' ? request : (request as Request).url || ''
      if (!isBackendRequest(url)) { return }
      const authHeaders = getAuthHeaders()
      const headers = new Headers(options.headers || {})
      for (const [key, value] of Object.entries(authHeaders)) {
        headers.append(key, value)
      }
      options.headers = headers
    }
  })

  // Wrap globalThis.fetch — covers Apollo's createUploadLink
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input instanceof Request ? input.url : String(input)
    if (!isBackendRequest(url)) {
      return originalFetch(input, init)
    }
    const authHeaders = getAuthHeaders()
    init = init || {}
    const headers = new Headers(init.headers || {})
    for (const [key, value] of Object.entries(authHeaders)) {
      headers.append(key, value)
    }
    init.headers = headers
    return originalFetch(input, init)
  }
})
