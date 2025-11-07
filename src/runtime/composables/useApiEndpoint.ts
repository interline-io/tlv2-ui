import { useRuntimeConfig } from '#imports'

export const useApiEndpoint = (path?: string, clientName?: string) => {
  clientName = clientName || 'default'
  const config = useRuntimeConfig()
  if (import.meta.server) {
    const proxyBases: Record<string, string> = config.tlv2?.proxyBase || {}
    return (proxyBases[clientName] || '') + (path || '')
  }
  if (typeof window !== 'undefined') {
    const clientApiBases: Record<string, string> = config.public.tlv2?.apiBase || {}
    const apiBase = clientApiBases[clientName] || window.location.origin + '/api/v2'
    return apiBase + (path || '')
  }
  return path || ''
}
