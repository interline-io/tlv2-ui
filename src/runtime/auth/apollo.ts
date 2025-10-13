import { ApolloClient, ApolloLink, concat, InMemoryCache } from '@apollo/client/core/index.js'
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'
import { destr } from 'destr'
import { ApolloClients, provideApolloClients } from '@vue/apollo-composable'
import { createApolloProvider } from '@vue/apollo-option'
import { useApiEndpoint, useAuthHeaders } from './auth'
import { useStationEditorApiEndpoint } from '../composables/useStationEditorApiEndpoint'
import { useFeedManagementApiEndpoint } from '../composables/useFeedManagementApiEndpoint'
import { debugLog } from '../lib/log'

export function initApolloClient (endpoint: string, headers: Record<string, string>) {
  const httpLink = createUploadLink({ uri: endpoint })
  const authMiddleware = new ApolloLink((operation, forward) => {
    // Add authorization headers
    operation.setContext({ headers: headers })
    return forward(operation)
  })
  const cache = new InMemoryCache()
  const apolloClient = new ApolloClient({
    link: concat(authMiddleware, httpLink),
    cache
  })
  return apolloClient
}

export async function getApolloClient () {
  const endpoint = useApiEndpoint('/query')
  const headers = await useAuthHeaders()
  const apolloClient = initApolloClient(endpoint, headers)
  debugLog('getApolloClient', endpoint)
  return apolloClient
}

export async function getStationEditorApolloClient () {
  const endpoint = useStationEditorApiEndpoint('/query')
  const headers = await useAuthHeaders()
  const apolloClient = initApolloClient(endpoint, headers)
  debugLog('getStationEditorApolloClient', endpoint)
  return apolloClient
}

export async function getFeedManagementApolloClient () {
  const endpoint = useFeedManagementApiEndpoint('/query')
  const headers = await useAuthHeaders()
  const apolloClient = initApolloClient(endpoint, headers)
  debugLog('getFeedManagementApolloClient', endpoint)
  return apolloClient
}

export const defineApolloPlugin = async (nuxtApp) => {
  debugLog('apollo plugin: start')
  const apolloClient = await getApolloClient()
  const stationEditorClient = await getStationEditorApolloClient()
  const feedManagementClient = await getFeedManagementApolloClient()

  // options api
  const apolloProvider = createApolloProvider({
    defaultClient: apolloClient,
    clients: {
      default: apolloClient,
      transitland: apolloClient,
      stationEditor: stationEditorClient,
      feedManagement: feedManagementClient
    }
  })
  nuxtApp.vueApp.use(apolloProvider)

  // composition api
  nuxtApp.vueApp.provide(ApolloClients, {
    default: apolloClient,
    transitland: apolloClient,
    stationEditor: stationEditorClient,
    feedManagement: feedManagementClient
  })
  provideApolloClients({
    default: apolloClient,
    transitland: apolloClient,
    stationEditor: stationEditorClient,
    feedManagement: feedManagementClient
  })

  // handle cache
  const cacheKey = '_apollo:transitland'
  nuxtApp.hook('app:rendered', () => {
    nuxtApp.payload.data[cacheKey] = apolloClient.cache.extract()
  })
  if (process.client && nuxtApp.payload.data[cacheKey]) {
    apolloClient.cache.restore(destr(JSON.stringify(nuxtApp.payload.data[cacheKey])))
  }
}
