import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { destr } from 'destr'
import { ApolloClients, provideApolloClients } from '@vue/apollo-composable'
import type { NormalizedCacheObject } from '@apollo/client/core/index.js'
import { ApolloClient, InMemoryCache } from '@apollo/client/core/index.js'
// @ts-expect-error - apollo-upload-client does not provide TypeScript definitions
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'

import { useApiEndpoint } from '../composables/useApiEndpoint'

// Apollo client factory
// Auth headers are injected globally by auth.server (SSR) and csrf.client (browser) plugins
// via globalThis.fetch, so no auth link is needed here.
function initApolloClient (endpoint: string) {
  const link = createUploadLink({
    uri: endpoint,
    credentials: 'same-origin',
  })

  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
    ssrMode: import.meta.server,
    connectToDevTools: import.meta.client,
  })
}

// Nuxt plugin
export default defineNuxtPlugin((nuxtApp) => {
  const defaultClient = initApolloClient(useApiEndpoint('/query', 'default'))
  const apolloClients = {
    default: defaultClient,
    stationEditor: initApolloClient(useApiEndpoint('/query', 'stationEditor')),
    feedManagement: initApolloClient(useApiEndpoint('/query', 'feedManagement')),
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
