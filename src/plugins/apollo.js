import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { ApolloClients } from '@vue/apollo-composable'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core/index.js'
import { createApolloProvider } from '@vue/apollo-option'


export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const httpLink = new HttpLink({
    uri: config.public.graphqlEndpoint,
    headers: {
      apikey: config.public.graphqlApikey
    }
  })
  const apolloClient = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache()
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

  // composable api
  nuxtApp.vueApp.provide(ApolloClients, { default: apolloClient, transitland: apolloClient })
  return {
    provide: {
      apolloClient
    }
  }
})
