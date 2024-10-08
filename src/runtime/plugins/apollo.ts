import { destr } from 'destr'
import { ApolloClients, provideApolloClients } from '@vue/apollo-composable'
import { createApolloProvider } from '@vue/apollo-option'
import { ApolloClient, ApolloLink, concat, InMemoryCache } from '@apollo/client/core/index.js'
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'
import { useJwt } from './auth'
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'

export function getApolloClient() {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase || ''
  const allowedReferer = process.server ? (config.allowedReferer || '') : ''
  return initApolloClient(
    String(apiBase),
    String(allowedReferer)
  )
}

export function initApolloClient(
  apiBase: string,
  allowedReferer: string
) {
  const httpLink = createUploadLink({
    uri: apiBase + '/query'
  })
  const authMiddleware = new ApolloLink(async(operation, forward) => {
    // add the authorization to the headers
    const token = await useJwt()
    operation.setContext({
      headers: {
        // Set Authoriation header
        authorization: token ? `Bearer ${token}` : '',
        // Needed for SSR
        referer: allowedReferer
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
