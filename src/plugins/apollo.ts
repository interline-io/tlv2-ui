import destr from 'destr'
import { ApolloClients } from '@vue/apollo-composable'
import { createApolloProvider } from '@vue/apollo-option'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core/index.js'
import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { useJwt } from './auth'

export function getApolloClient(token: string) {
  const config = useRuntimeConfig()
  const headers = {
    referer: config.public.graphqlServerReferer,
    apikey: config.public.graphqlApikey,
    authorization: token ? 'Bearer ' + token : ''
  }
  const httpLink = new HttpLink({
    uri: config.public.graphqlEndpoint,
    headers
  })
  const cache = new InMemoryCache()
  const apolloClient = new ApolloClient({
    link: httpLink,
    cache
  })
  return apolloClient
}

export default defineNuxtPlugin((nuxtApp) => {
  const token = useJwt()
  const apolloClient = getApolloClient(token)

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
