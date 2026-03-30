import { useFetch } from '#imports'
import type { UseFetchOptions, AsyncData } from 'nuxt/app'
import type { FetchError } from 'ofetch'
import { useApiEndpoint } from '../../composables/useApiEndpoint'

export function useAdminFetch<T> (path: string | (() => string), options: UseFetchOptions<T> = {}): AsyncData<T | undefined, FetchError | null> {
  const apiEndpoint = useApiEndpoint('', 'feedManagement')

  return useFetch(path, {
    baseURL: apiEndpoint + '/admin',
    credentials: 'same-origin',
    ...options
  }) as AsyncData<T | undefined, FetchError | null>
}

export async function fetchAdmin<T> (path: string, options: any = {}) {
  const apiEndpoint = useApiEndpoint('', 'feedManagement')

  return $fetch<T>(path, {
    baseURL: apiEndpoint + '/admin',
    credentials: 'same-origin',
    ...options
  })
}
