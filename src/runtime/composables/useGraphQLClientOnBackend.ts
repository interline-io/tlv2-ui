import { proxyHandler } from '../plugins/proxy'
import { useRuntimeConfig } from 'h3'

/**
 * Server-side composable for creating proxy-based GraphQL clients on the backend
 * Usage: const client = useGraphQLClientOnBackend(event, userJwt)
 */
export const useGraphQLClientOnBackend = (event: any, userJwt: string) => {
  const runtimeConfig = useRuntimeConfig()

  const client = {
    async query<T = any>(_query: any, _variables?: any): Promise<{ data?: T }> {
      // Forward the GraphQL query through the proxy
      const proxyEvent = {
        ...event,
        path: '/api/v2/graphql',
        method: 'POST'
      }

      const response = await proxyHandler(
        proxyEvent as any,
        runtimeConfig.proxyBase as string,
        userJwt
      )

      // Parse the response
      const result = await response.json()

      if (result.errors) {
        throw new Error(`GraphQL errors: ${result.errors.map((e: any) => e.message).join(', ')}`)
      }

      return result
    }
  }

  return client
}

/**
 * Type for the GraphQL client on backend composable
 */
export type GraphQLClientOnBackend = ReturnType<typeof useGraphQLClientOnBackend>
