import type { NuxtApp } from 'nuxt/app'
import { defineNuxtPlugin } from 'nuxt/app'
import { destr } from 'destr'
import { ApolloClients, provideApolloClients } from '@vue/apollo-composable'
import { createApolloProvider } from '@vue/apollo-option'
import type { NormalizedCacheObject } from '@apollo/client/core/index.js'
import { ApolloClient, InMemoryCache } from '@apollo/client/core/index.js'
import { setContext } from '@apollo/client/link/context'
// @ts-expect-error - apollo-upload-client does not provide TypeScript definitions
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'

// Our composables
import { useApiEndpoint } from '../composables/useApiEndpoint'
import { useAuthHeaders } from '../composables/useAuthHeaders'
import { logAuthDebug } from '../lib'

// Apollo client factory
function initApolloClient (nuxtApp: NuxtApp, endpoint: string) {
  const httpLink = createUploadLink({
    uri: endpoint,
    credentials: 'same-origin', // or 'include' if hitting another origin
  })

  // Will be run before *every* operation
  const authLink = setContext(async (_, { headers }) => {
    // Wrap composable call so Nuxt context is available here
    const authHeaders = await nuxtApp.runWithContext(async () => {
      const headers = await useAuthHeaders()
      logAuthDebug('apollo: authLink: refreshed headers')
      return headers
    })

    return {
      headers: {
        ...(headers || {}),
        ...(authHeaders || {}),
      },
    }
  })

  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
    ssrMode: import.meta.server,
    connectToDevTools: import.meta.client,
  })
}

// Nuxt plugin
export default defineNuxtPlugin((nuxtApp) => {
  const app = nuxtApp as NuxtApp
  const defaultClient = initApolloClient(app, useApiEndpoint('/query', 'default'),)
  const apolloClients = {
    default: defaultClient,
    stationEditor: initApolloClient(app, useApiEndpoint('/query', 'stationEditor')),
    feedManagement: initApolloClient(app, useApiEndpoint('/query', 'feedManagement')),
  }

  // Restore cache on client
  if (import.meta.client && nuxtApp.payload.data['_apollo:default']) {
    const cacheState = destr(
      JSON.stringify(nuxtApp.payload.data['_apollo:default'])
    ) as NormalizedCacheObject
    defaultClient.cache.restore(cacheState)
  }

  // Options API
  const apolloProvider = createApolloProvider({
    defaultClient,
    clients: { ...apolloClients }
  })
  nuxtApp.vueApp.use(apolloProvider)

  // Composition API
  nuxtApp.vueApp.provide(ApolloClients, { ...apolloClients })
  provideApolloClients({ ...apolloClients })

  // Extract cache on server after rendering
  nuxtApp.hook('app:rendered', () => {
    nuxtApp.payload.data['_apollo:default']
      = defaultClient.cache.extract()
  })
})
