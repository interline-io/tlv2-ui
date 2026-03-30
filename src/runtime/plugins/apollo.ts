import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { destr } from 'destr'
import { ApolloClients, provideApolloClients } from '@vue/apollo-composable'
import type { NormalizedCacheObject, ApolloLink } from '@apollo/client/core/index.js'
import { ApolloClient, InMemoryCache } from '@apollo/client/core/index.js'
import { setContext } from '@apollo/client/link/context'
// @ts-expect-error - apollo-upload-client does not provide TypeScript definitions
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'

import { useApiEndpoint } from '../composables/useApiEndpoint'

// Apollo client factory
function initApolloClient (
  nuxtApp: any,
  endpoint: string,
  graphqlApikey: string
) {
  const httpLink = createUploadLink({
    uri: endpoint,
    credentials: 'same-origin',
  })

  let link: ApolloLink = httpLink

  if (import.meta.server) {
    // Server-side: inject apikey and user's JWT from auth0-nuxt session
    const ssrAuthLink = setContext(async (_, { headers }) => {
      const authHeaders: Record<string, string> = {
        ...(headers || {}),
      }
      if (graphqlApikey) {
        authHeaders.apikey = graphqlApikey
      }
      try {
        const event = nuxtApp.ssrContext?.event
        if (event) {
          // @ts-expect-error — type available at runtime via Nitro auto-imports
          const auth0 = useAuth0(event)
          const tokenSet = await auth0.getAccessToken()
          if (tokenSet.accessToken) {
            authHeaders.Authorization = `Bearer ${tokenSet.accessToken}`
          }
        }
      } catch {
        // No valid session — continue without user auth
      }
      return { headers: authHeaders }
    })
    link = ssrAuthLink.concat(httpLink)
  }
  // Client-side: CSRF injected globally by csrf.client plugin, auth via session cookie + proxy

  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
    ssrMode: import.meta.server,
    connectToDevTools: import.meta.client,
  })
}

// Nuxt plugin
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const graphqlApikey = (import.meta.server ? config.tlv2?.graphqlApikey : '') || ''

  const defaultClient = initApolloClient(nuxtApp, useApiEndpoint('/query', 'default'), graphqlApikey)
  const apolloClients = {
    default: defaultClient,
    stationEditor: initApolloClient(nuxtApp, useApiEndpoint('/query', 'stationEditor'), graphqlApikey),
    feedManagement: initApolloClient(nuxtApp, useApiEndpoint('/query', 'feedManagement'), graphqlApikey),
  }

  // Restore cache on client
  if (import.meta.client && nuxtApp.payload.data['_apollo:default']) {
    const cacheState = destr(
      JSON.stringify(nuxtApp.payload.data['_apollo:default'])
    ) as NormalizedCacheObject
    defaultClient.cache.restore(cacheState)
  }

  // Provide via Vue's DI so it works regardless of module deduplication
  nuxtApp.vueApp.provide(ApolloClients, apolloClients)
  // Also set the module-level variable for non-component contexts
  provideApolloClients({ ...apolloClients })

  // Extract cache on server after rendering
  nuxtApp.hook('app:rendered', () => {
    nuxtApp.payload.data['_apollo:default']
      = defaultClient.cache.extract()
  })
})
