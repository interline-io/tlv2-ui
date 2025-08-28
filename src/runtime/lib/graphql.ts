import { print } from 'graphql'

/**
 * Interface for GraphQL client
 * Implementations should provide the actual GraphQL query execution
 */
export interface GraphQLClient {
  query<T = any>(query: any, variables?: any): Promise<{ data?: T }>
}

/**
 * Options for BasicGraphQLClient
 */
export interface BasicGraphQLClientOptions {
  /** Custom fetch handler that may already be configured with headers, authentication, etc. */
  fetchHandler?: (url: string, init?: RequestInit) => Promise<Response>
}

/**
 * Real GraphQL client for testing with actual API calls
 * Uses a supplied fetch handler or defaults to system fetch
 */
export class BasicGraphQLClient implements GraphQLClient {
  private endpoint: string
  private fetchHandler: (url: string, init?: RequestInit) => Promise<Response>

  constructor (endpoint: string, options: BasicGraphQLClientOptions = {}) {
    this.endpoint = endpoint
    this.fetchHandler = options.fetchHandler || fetch
  }

  async query<T = any>(query: any, variables?: any): Promise<{ data?: T }> {
    // Extract query string from DocumentNode or use as-is if string
    let queryString: string
    if (typeof query === 'string') {
      queryString = query
    } else {
      // Use graphql print function to convert DocumentNode to string
      queryString = print(query)
    }

    const requestBody = {
      query: queryString,
      variables,
    }

    try {
      const response = await this.fetchHandler(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.errors) {
        throw new Error(`GraphQL errors: ${result.errors.map((e: any) => e.message).join(', ')}`)
      }
      return result
    } catch (error) {
      console.error('GraphQL request failed:', error)
      throw error
    }
  }
}
