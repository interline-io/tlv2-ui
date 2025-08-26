import { proxyHandler } from '../plugins/proxy'
import type { H3Event } from 'h3'
import type { DocumentNode } from 'graphql'
import { useRuntimeConfig } from '#imports'

/**
 * Server-side utility for creating proxy-based GraphQL clients on the backend
 * Usage: const client = createGraphQLClientOnBackend(event, userJwt)
 *
 * This is placed in tlv2-ui runtime utils so it can be shared across applications
 * and properly access Nuxt composables when imported into server contexts
 */
export const createGraphQLClientOnBackend = (event: H3Event, userJwt: string) => {
  const runtimeConfig = useRuntimeConfig(event)

  console.log('createGraphQLClientOnBackend: event type:', typeof event)
  console.log('createGraphQLClientOnBackend: event headers:', event.headers)
  console.log('createGraphQLClientOnBackend: userJwt length:', userJwt?.length || 0)
  console.log('createGraphQLClientOnBackend: proxyBase:', runtimeConfig.proxyBase)

  const client = {
    async query<T = any>(query: string | DocumentNode, variables?: Record<string, any>): Promise<{ data?: T }> {
      // Forward the GraphQL query through the proxy
      const proxyEvent = {
        ...event,
        path: '/api/v2/graphql',
        method: 'POST',
        headers: event.headers // Explicitly preserve headers
      } as H3Event

      console.log('createGraphQLClientOnBackend: proxyEvent headers:', proxyEvent.headers)
      console.log('createGraphQLClientOnBackend: About to call proxyHandler...')

      const response = await proxyHandler(
        proxyEvent,
        runtimeConfig.proxyBase as string,
        userJwt
      )

      console.log('createGraphQLClientOnBackend: proxyHandler response type:', typeof response)
      console.log('createGraphQLClientOnBackend: proxyHandler response:', response)
      console.log('createGraphQLClientOnBackend: response methods:', response ? Object.getOwnPropertyNames(response) : 'N/A')

      // Parse the response - handle both fetch Response and Node.js ServerResponse
      let result
      if (response && typeof response.json === 'function') {
        // This is a fetch Response
        result = await response.json()
      } else if (response && typeof response.text === 'function') {
        // This is a fetch Response with text method
        const text = await response.text()
        result = JSON.parse(text)
      } else if (response && typeof response === 'object' && 'statusCode' in response) {
        // This is a Node.js ServerResponse - we need to handle it differently
        console.log('createGraphQLClientOnBackend: Handling Node.js ServerResponse')

        // For now, let's check if we can get the response body
        if (response.req && response.req._events && response.req._events.data) {
          // Try to get the response data from the request events
          console.log('createGraphQLClientOnBackend: Found request data events')
          // This is complex - let's try a different approach
        }

        // Since we can't easily extract the body from ServerResponse,
        // let's throw a more helpful error
        throw new Error(`Proxy returned Node.js ServerResponse (status: ${(response as any).statusCode}). The proxy needs to be configured to return fetch Response objects.`)
      } else {
        console.error('Unexpected response type from proxyHandler:', response)
        throw new Error('Invalid response from proxy handler')
      }

      if (result.errors) {
        throw new Error(`GraphQL errors: ${result.errors.map((e: any) => e.message).join(', ')}`)
      }

      return result
    }
  }

  return client
}

/**
 * Type for the GraphQL client on backend utility
 */
export type GraphQLClientOnBackend = ReturnType<typeof createGraphQLClientOnBackend>
