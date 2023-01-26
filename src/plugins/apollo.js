import { defineNuxtPlugin, useRuntimeConfig } from "#app";
import { createApolloProvider } from '@vue/apollo-option'
import { ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client/core/index.js'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const httpLink = new createHttpLink({ 
    uri: config.public.graphqlEndpoint,
    headers: {
      apikey: config.public.graphqlApikey
    }
  });
  const apolloClient = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  });
  const apolloProvider = createApolloProvider({
    defaultClient: apolloClient,
    clients: { transitland: apolloClient }
  })
  nuxtApp.vueApp.use(apolloProvider)
})
