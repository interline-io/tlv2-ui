import { useFetch } from '#imports'
import type { UseFetchOptions } from 'nuxt/app'
import { useApiEndpoint } from '../../../composables/useApiEndpoint'
import { useAuthHeaders } from '../../../composables/useAuthHeaders'

export function useAdminFetch<T> (path: string | (() => string), options: UseFetchOptions<T> = {}) {
  const apiEndpoint = useApiEndpoint('', 'feedManagement')

  return useFetch(path, {
    baseURL: apiEndpoint + '/admin',
    onRequest: async ({ options }) => {
      const authHeaders = await useAuthHeaders()
      options.headers = {
        ...options.headers,
        ...authHeaders
      }
    },
    ...options
  })
}

export async function fetchAdmin<T> (path: string, options: any = {}) {
  const apiEndpoint = useApiEndpoint('', 'feedManagement')
  const authHeaders = await useAuthHeaders()

  return $fetch<T>(path, {
    baseURL: apiEndpoint + '/admin',
    headers: {
      ...options.headers,
      ...authHeaders
    },
    ...options
  })
}
