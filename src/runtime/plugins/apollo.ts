import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { destr } from 'destr'
import { ApolloClients, provideApolloClients } from '@vue/apollo-composable'
import type { NormalizedCacheObject } from '@apollo/client/core/index.js'
import { ApolloClient, InMemoryCache } from '@apollo/client/core/index.js'
import { setContext } from '@apollo/client/link/context'
// @ts-expect-error - apollo-upload-client does not provide TypeScript definitions
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'

import { useApiEndpoint } from '../composables/useApiEndpoint'

// Apollo client factory
// Client-side: requests go to the proxy (/api/v2/...) and the session cookie
// is sent automatically. The proxy extracts the JWT and signs backend requests.
// Server-side: requests go directly to the backend with apikey auth.
function initApolloClient (endpoint: string, graphqlApikey: string) {
  const httpLink = createUploadLink({
    uri: endpoint,
    credentials: 'same-origin',
  })

  // Server-side only: inject apikey header for direct backend access
  if (import.meta.server && graphqlApikey) {
    const authLink = setContext((_, { headers }) => ({
      headers: {
        ...(headers || {}),
        apikey: graphqlApikey
      }
    }))
    return new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache(),
      ssrMode: true,
    })
  }

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    ssrMode: import.meta.server,
    connectToDevTools: import.meta.client,
  })
}

// Nuxt plugin
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const graphqlApikey = (import.meta.server ? config.tlv2?.graphqlApikey : '') || ''

  const defaultClient = initApolloClient(useApiEndpoint('/query', 'default'), graphqlApikey)
  const apolloClients = {
    default: defaultClient,
    stationEditor: initApolloClient(useApiEndpoint('/query', 'stationEditor'), graphqlApikey),
    feedManagement: initApolloClient(useApiEndpoint('/query', 'feedManagement'), graphqlApikey),
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
