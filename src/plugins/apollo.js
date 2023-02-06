import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { DefaultApolloClient } from '@vue/apollo-composable'
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core/index.js'

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
  nuxtApp.vueApp.provide(DefaultApolloClient, apolloClient)
  return {
    provide: {
      apolloClient
    }
  }
})
