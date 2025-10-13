import { ApolloClient, ApolloLink, concat, InMemoryCache } from '@apollo/client/core/index.js'
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'
import { destr } from 'destr'
import { ApolloClients, provideApolloClients } from '@vue/apollo-composable'
import { createApolloProvider } from '@vue/apollo-option'
import { useRuntimeConfig } from 'nuxt/app'
import { useAuthHeaders } from './auth'
import { debugLog } from '../lib/log'

function getApiEndpoint (clientType: 'default' | 'stationEditor' | 'feedManagement', path?: string) {
  const config = useRuntimeConfig()
  const tlv2Config = config.public.tlv2 as any
  const defaultEndpoint = typeof window !== 'undefined' ? window.location.origin + '/api/v2' : ''

  let apiBase: string
  if (clientType === 'feedManagement') {
    // Fallback chain: feedManagementApiBase → stationEditorApiBase → apiBase → window origin
    apiBase = tlv2Config?.feedManagementApiBase
      || tlv2Config?.stationEditorApiBase
      || tlv2Config?.apiBase
      || defaultEndpoint
  } else if (clientType === 'stationEditor') {
    // Fallback chain: stationEditorApiBase → apiBase → window origin
    apiBase = tlv2Config?.stationEditorApiBase
      || tlv2Config?.apiBase
      || defaultEndpoint
  } else {
    // Fallback chain: apiBase → window origin
    apiBase = tlv2Config?.apiBase || defaultEndpoint
  }

  return apiBase + (path || '')
}

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
  const endpoint = getApiEndpoint('default', '/query')
  const headers = await useAuthHeaders()
  const apolloClient = initApolloClient(endpoint, headers)
  debugLog('getApolloClient', endpoint)
  return apolloClient
}

export async function getStationEditorApolloClient () {
  const endpoint = getApiEndpoint('stationEditor', '/query')
  const headers = await useAuthHeaders()
  const apolloClient = initApolloClient(endpoint, headers)
  debugLog('getStationEditorApolloClient', endpoint)
  return apolloClient
}

export async function getFeedManagementApolloClient () {
  const endpoint = getApiEndpoint('feedManagement', '/query')
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
