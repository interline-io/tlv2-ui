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

  if (import.meta.server && graphqlApikey) {
    // Server-side: inject apikey header for direct backend access
    const apikeyLink = setContext((_, { headers }) => ({
      headers: {
        ...(headers || {}),
        apikey: graphqlApikey
      }
    }))
    link = apikeyLink.concat(httpLink)
  }
  // Client-side: no auth link needed — proxy handles auth via session cookie

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
