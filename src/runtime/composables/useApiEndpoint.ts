import { useRuntimeConfig } from '#imports'

export const useApiEndpoint = (path?: string, clientName?: string) => {
  clientName = clientName || 'default'
  const config = useRuntimeConfig()
  const proxyBases: Record<string, string> = config.tlv2?.proxyBase || {}
  const clientApiBases: Record<string, string> = config.public.tlv2?.apiBase || {}
  const apiBase = import.meta.server
    ? (proxyBases[clientName] || '')
    : (clientApiBases[clientName] || window?.location?.origin + '/api/v2') || ''
  return apiBase + (path || '')
}
