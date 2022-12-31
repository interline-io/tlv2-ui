import { createApolloProvider } from '@vue/apollo-option'
import { ApolloClient, InMemoryCache } from '@apollo/client/core'

const cache = new InMemoryCache()

const apolloClient = new ApolloClient({
  cache,
  uri: 'https://api.transit.land/api/v2/query?apikey=',
  httpLinkOptions: {
    credentials: 'same-origin',
    headers: {
      apikey: ''
    }
  }
})

const apolloProvider = createApolloProvider({
  defaultClient: apolloClient,
  clients: { transitland: apolloClient }
})

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(apolloProvider)
})
