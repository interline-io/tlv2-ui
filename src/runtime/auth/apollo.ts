import { ApolloClient, ApolloLink, concat, InMemoryCache } from '@apollo/client/core/index.js'
// @ts-expect-error - apollo-upload-client does not provide TypeScript definitions
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'

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
