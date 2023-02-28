import destr from 'destr'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { ApolloClients } from '@vue/apollo-composable'
import { createApolloProvider } from '@vue/apollo-option'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core/index.js'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const endpoint = process.client ? config.public.graphqlEndpoint : config.ssrGraphqlEndpoint
  const apikey = process.client ? config.public.graphqlApikey : config.ssrGraphqlApikey
  const httpLink = new HttpLink({
    uri: endpoint,
    headers: {
      apikey: apikey,
      referer: config.ssrGraphqlServerReferer,
    }
  })
  const cache = new InMemoryCache()

  const apolloClient = new ApolloClient({
    link: httpLink,
    cache
  })

  // options api
  const apolloProvider = createApolloProvider({
    defaultClient: apolloClient,
    clients: {
      default: apolloClient,
      transitland: apolloClient
    }
  })
  nuxtApp.vueApp.use(apolloProvider)

  // composition api
  nuxtApp.vueApp.provide(ApolloClients, { default: apolloClient, transitland: apolloClient })

  // handle cache
  const cacheKey = '_apollo:transitland'
  nuxtApp.hook('app:rendered', () => {
    nuxtApp.payload.data[cacheKey] = cache.extract()
  })
  if (process.client && nuxtApp.payload.data[cacheKey]) {
    cache.restore(destr(JSON.stringify(nuxtApp.payload.data[cacheKey])))
  }
})
