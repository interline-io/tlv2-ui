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

      // Parse the response
      let result
      if (response && typeof response.json === 'function') {
        result = await response.json()
      } else if (response && typeof response.text === 'function') {
        const text = await response.text()
        result = JSON.parse(text)
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
