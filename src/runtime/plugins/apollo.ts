import type { NuxtApp } from 'nuxt/app'
import { defineNuxtPlugin } from 'nuxt/app'
import { destr } from 'destr'
import { ApolloClients, provideApolloClients } from '@vue/apollo-composable'
import { createApolloProvider } from '@vue/apollo-option'
import {
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  Observable,
  type NormalizedCacheObject,
  type Operation,
  type NextLink,
  type FetchResult
} from '@apollo/client/core/index.js'

// Our composables
import { useApiEndpoint } from '../composables/useApiEndpoint'
import { useAuthHeaders } from '../composables/useAuthHeaders'
import { logAuthDebug } from '../lib'

// Custom Apollo Link that uses Nuxt's $fetch with auth headers
function createNuxtFetchLink (nuxtApp: NuxtApp, endpoint: string) {
  return new ApolloLink((operation: Operation, _forward?: NextLink) => {
    return new Observable<FetchResult>((observer) => {
      const controller = new AbortController()

      // Execute the GraphQL operation using $fetch
      nuxtApp.runWithContext(async () => {
        try {
          // Get auth headers (server: cookie + API key, client: CSRF only)
          const authHeaders = useAuthHeaders()
          logAuthDebug('apollo: nuxt fetch link: using auth headers + cookies')

          // Use $fetch with cookies automatically included for same-origin requests
          const result = await $csrfFetch<FetchResult>(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...authHeaders
            },
            body: {
              query: operation.query,
              variables: operation.variables,
              operationName: operation.operationName
            },
            signal: controller.signal
          })

          observer.next(result)
          observer.complete()
        } catch (error) {
          observer.error(error)
        }
      })

      // Return cleanup function
      return () => {
        controller.abort()
      }
    })
  })
}

// Apollo client factory
function initApolloClient (nuxtApp: NuxtApp, endpoint: string) {
  // Use our custom Nuxt $fetch link instead of createUploadLink
  const httpLink = createNuxtFetchLink(nuxtApp, endpoint)

  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    ssrMode: import.meta.server,
    connectToDevTools: import.meta.client,
  })
}

// Nuxt plugin
export default defineNuxtPlugin((nuxtApp) => {
  const app = nuxtApp as NuxtApp
  const defaultClient = initApolloClient(app, useApiEndpoint('/query', 'default'))
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
