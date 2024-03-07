import destr from 'destr'
import { ApolloClients } from '@vue/apollo-composable'
import { createApolloProvider } from '@vue/apollo-option'
import { ApolloClient, ApolloLink, concat, HttpLink, InMemoryCache } from '@apollo/client/core/index.js'
import { useJwt } from './auth'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'

export function getApolloClient() {
  const config = useRuntimeConfig()
  const httpLink = new HttpLink({
    uri: config.public.graphqlEndpoint
  })
  const authMiddleware = new ApolloLink(async(operation, forward) => {
    // add the authorization to the headers
    const token = await useJwt()
    operation.setContext({
      headers: {
        referer: config.public.graphqlServerReferer,
        authorization: token ? `Bearer ${token}` : '',
        apikey: config.public.graphqlApikey
      }
    })
    return forward(operation)
  })
  const cache = new InMemoryCache()
  const apolloClient = new ApolloClient({
    link: concat(authMiddleware, httpLink),
    cache
  })
  return apolloClient
}

export default defineNuxtPlugin((nuxtApp) => {
  const apolloClient = getApolloClient()

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
    nuxtApp.payload.data[cacheKey] = apolloClient.cache.extract()
  })
  if (process.client && nuxtApp.payload.data[cacheKey]) {
    apolloClient.cache.restore(destr(JSON.stringify(nuxtApp.payload.data[cacheKey])))
  }
})
