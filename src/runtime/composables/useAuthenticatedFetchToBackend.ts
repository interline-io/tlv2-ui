import { useJwt } from '../plugins/auth'

/**
 * Authenticated fetch utility that automatically includes JWT tokens when making requests to backend endpoints
 * Usage: const authFetch = useAuthenticatedFetchToBackend()
 */
export const useAuthenticatedFetchToBackend = () => {
  /**
   * Authenticated fetch function that includes JWT token
   * @param url - The URL to fetch from (typically backend endpoints like /api/wsdot)
   * @param options - Fetch options (method, body, headers, etc.)
   * @returns Promise with the response
   */
  const authFetch = async <T = any>(url: string, options: any = {}): Promise<T> => {
    try {
      // Get fresh JWT token
      const token = await useJwt()

      // Prepare headers with authentication
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers
      }

      // Add JWT token if available
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      // Make the authenticated request
      const response = await $fetch<T>(url, {
        ...options,
        headers
      })

      return response
    } catch (error) {
      // Re-throw the error for handling by the caller
      throw error
    }
  }

  /**
   * POST request with authentication
   */
  const post = async <T = any>(url: string, body: any, options: any = {}): Promise<T> => {
    return authFetch<T>(url, {
      method: 'POST',
      body,
      ...options
    })
  }

  /**
   * GET request with authentication
   */
  const get = async <T = any>(url: string, options: any = {}): Promise<T> => {
    return authFetch<T>(url, {
      method: 'GET',
      ...options
    })
  }

  /**
   * PUT request with authentication
   */
  const put = async <T = any>(url: string, body: any, options: any = {}): Promise<T> => {
    return authFetch<T>(url, {
      method: 'PUT',
      body,
      ...options
    })
  }

  /**
   * DELETE request with authentication
   */
  const del = async <T = any>(url: string, options: any = {}): Promise<T> => {
    return authFetch<T>(url, {
      method: 'DELETE',
      ...options
    })
  }

  /**
   * PATCH request with authentication
   */
  const patch = async <T = any>(url: string, body: any, options: any = {}): Promise<T> => {
    return authFetch<T>(url, {
      method: 'PATCH',
      body,
      ...options
    })
  }

  return {
    fetch: authFetch,
    post,
    get,
    put,
    delete: del,
    patch
  }
}

/**
 * Type for the authenticated fetch to backend composable
 */
export type AuthenticatedFetchToBackend = ReturnType<typeof useAuthenticatedFetchToBackend>
