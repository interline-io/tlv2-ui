import { useFetch } from '#imports'
import type { UseFetchOptions, AsyncData } from 'nuxt/app'
import type { FetchError } from 'ofetch'
import { useApiEndpoint } from '../../../composables/useApiEndpoint'
import { useAuthHeaders } from '../../../composables/useAuthHeaders'

export function useAdminFetch<T> (path: string | (() => string), options: UseFetchOptions<T> = {}): AsyncData<T | undefined, FetchError | null> {
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
  }) as AsyncData<T | undefined, FetchError | null>
}

export async function fetchAdmin<T> (path: string, options: any = {}) {
  const apiEndpoint = useApiEndpoint('', 'feedManagement')
  const authHeaders = await useAuthHeaders()

  return $fetch<T>(path, {
    baseURL: apiEndpoint + '/admin',
    credentials: 'same-origin',
    headers: {
      ...options.headers,
      ...authHeaders
    },
    ...options
  })
}
