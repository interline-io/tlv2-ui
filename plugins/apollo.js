import { createApolloProvider } from '@vue/apollo-option'
import { ApolloClient, InMemoryCache } from '@apollo/client/core'
import { HttpLink } from 'apollo-link-http'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const httpLink = new HttpLink({ 
    uri: config.public.graphqlEndpoint ,
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
