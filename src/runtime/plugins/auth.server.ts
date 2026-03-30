import { defineNuxtPlugin, useRuntimeConfig } from '#imports'

// Server-side auth header injection for SSR requests.
// Overrides globalThis.$fetch to inject the user's JWT and API key
// so that SSR data fetching has the same auth context as the original request.
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const graphqlApikey = config.tlv2?.graphqlApikey || ''

  globalThis.$fetch = globalThis.$fetch.create({
    async onRequest ({ options }) {
      const headers = new Headers(options.headers || {})
      if (graphqlApikey) {
        headers.append('apikey', graphqlApikey)
      }
      try {
        const event = nuxtApp.ssrContext?.event
        if (event) {
          // @ts-expect-error — type available at runtime via Nitro auto-imports
          const auth0 = useAuth0(event)
          const tokenSet = await auth0.getAccessToken()
          if (tokenSet.accessToken) {
            headers.append('Authorization', `Bearer ${tokenSet.accessToken}`)
          }
        }
      } catch {
        // No valid session — continue without user auth
      }
      options.headers = headers
    }
  })
})
