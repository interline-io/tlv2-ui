import { ApolloClient, InMemoryCache } from '@apollo/client/core/index.js'
import { setContext } from '@apollo/client/link/context/index.js'
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'

export function initApolloClient (endpoint: string, getHeaders: () => Promise<Record<string, string>>) {
  const httpLink = createUploadLink({ uri: endpoint })
  // Fetch authorization headers dynamically on each request
  const authMiddleware = setContext(async () => {
    const headers = await getHeaders()
    return { headers }
  })
  const cache = new InMemoryCache()
  const apolloClient = new ApolloClient({
    link: authMiddleware.concat(httpLink),
    cache
  })
  return apolloClient
}
