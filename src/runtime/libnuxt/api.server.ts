import { useRuntimeConfig, useCsrf } from '#imports'

export const useTransitlandApiBase = (path?: string): string => {
  const config = useRuntimeConfig()
  const base: string = config.public.transitlandApiBase || '/api/v2'
  return path ? base + path : base
}

export const useAuthHeaders = async () => {
  const config = useRuntimeConfig()
  const headers: Record<string, string> = {}

  // CSRF
  if (config.public.tlv2?.useProxy) {
    const { headerName: csrfHeader, csrf: csrfToken } = await useCsrf()
    headers[csrfHeader] = csrfToken
  }

  // Server might use API keys or other auth
  if (config.apiToken) {
    headers['Authorization'] = `Bearer ${config.apiToken}`
  }

  return headers
}
