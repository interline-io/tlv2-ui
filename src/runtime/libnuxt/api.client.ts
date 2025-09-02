import { useRuntimeConfig, useCsrf } from '#imports'
import { checkToken } from './user.client'

export const useTransitlandApiBase = (path?: string): string => {
  const config = useRuntimeConfig()
  const base: string = config.public.transitlandApiBase
    || (window?.location?.origin + '/api/v2')
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

  // JWT from localStorage/cookies
  const { token } = await checkToken()
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}
