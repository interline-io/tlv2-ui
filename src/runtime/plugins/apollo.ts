import { destr } from 'destr'
import { ApolloClients, provideApolloClients } from '@vue/apollo-composable'
import { createApolloProvider } from '@vue/apollo-option'
import { ApolloClient, ApolloLink, concat, InMemoryCache } from '@apollo/client/core/index.js'
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'
import { useJwt } from './auth'
import { defineNuxtPlugin, useRuntimeConfig, useCsrf, useNuxtApp } from '#imports'

export function getApolloClient() {
  const config = useRuntimeConfig()
  const apiBase = import.meta.server ? (config.proxyBase) : (config.public.apiBase || '')
  const apiKey = import.meta.server ? config.graphqlApikey : ''
  return initApolloClient(
    String(apiBase),
    String(apiKey)
  )
}

export function initApolloClient(
  apiBase: string,
  graphqlApikey: string
) {
  const httpLink = createUploadLink({
    uri: apiBase + '/query',
  })
  const authMiddleware = new ApolloLink(async (operation, forward) => {
    // add the authorization to the headers
    const { csrf } = useCsrf()
    const token = await useJwt()
    const headers = removeEmpty({
      // Set Authoriation header
      authorization: token ? `Bearer ${token}` : null,
      // Set graphql api key if not going through proxy
      apikey: graphqlApikey || null,
      // Set the csurf token, if available
      'csrf-token': csrf || null,
    })
    operation.setContext({ headers })
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
  provideApolloClients({ default: apolloClient, transitland: apolloClient })

  // handle cache
  const cacheKey = '_apollo:transitland'
  nuxtApp.hook('app:rendered', () => {
    nuxtApp.payload.data[cacheKey] = apolloClient.cache.extract()
  })
  if (process.client && nuxtApp.payload.data[cacheKey]) {
    apolloClient.cache.restore(destr(JSON.stringify(nuxtApp.payload.data[cacheKey])))
  }
})

function removeEmpty(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
}