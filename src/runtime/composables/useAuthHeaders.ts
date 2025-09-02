import { useAuthHeaders as useAuthHeadersServer } from '../libnuxt/api.client'
import { useAuthHeaders as useAuthHeadersClient } from '../libnuxt/api.server'

export function useAuthHeaders () {
  if (process.server) {
    return useAuthHeadersServer()
  }
  return useAuthHeadersClient()
}
