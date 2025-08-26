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

        // Check if the response has a readable stream
        if (response.req && response.req._events && response.req._events.data) {
          console.log('createGraphQLClientOnBackend: Found request data events')
        }

        // For Node.js responses, we need to read the response body differently
        // The response body is typically available in the _data property or as a stream
        if (response._data && response._data instanceof ReadableStream) {
          try {
            const reader = response._data.getReader()
            const chunks = []
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              chunks.push(value)
            }
            const bodyText = new TextDecoder().decode(Buffer.concat(chunks))
            result = JSON.parse(bodyText)
          } catch (error) {
            console.error('createGraphQLClientOnBackend: Error reading response stream:', error)
            throw new Error(`Failed to read response body: ${error.message}`)
          }
        } else {
          // If we can't read the body, check if it's a redirect and follow it
          const statusCode = (response as any).statusCode
          if (statusCode === 301 || statusCode === 302) {
            const location = (response as any)._outHeaders?.location?.[1]
              || (response as any)._header?.match(/location: (.+)/i)?.[1]
            if (location) {
              console.log('createGraphQLClientOnBackend: Following redirect to:', location)
              // For now, throw an error indicating we need to handle redirects
              throw new Error(`Received ${statusCode} redirect to ${location}. The proxy needs to handle redirects automatically.`)
            }
          }

          throw new Error(`Cannot read response body from Node.js ServerResponse (status: ${statusCode}). The proxy needs to return fetch Response objects.`)
        }
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
