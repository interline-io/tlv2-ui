import { ApolloClient, ApolloLink, concat, InMemoryCache } from '@apollo/client/core/index.js'
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'
import { useAuthHeaders } from './auth'
import { logAuthDebug } from '../lib/log'

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
  logAuthDebug('getApolloClient', endpoint)
  return apolloClient
}
