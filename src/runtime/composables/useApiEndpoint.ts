import { useRuntimeConfig } from '#imports'

export const useApiEndpoint = (path?: string, clientName?: string) => {
  clientName = clientName || 'default'
  let base = ''
  const config = useRuntimeConfig()
  if (import.meta.server) {
    const proxyBases: Record<string, string> = config.tlv2?.proxyBase || {}
    base = (proxyBases[clientName] || '')
  }
  if (typeof window !== 'undefined') {
    const clientApiBases: Record<string, string> = config.public.tlv2?.apiBase || {}
    base = clientApiBases[clientName] || window.location.origin + '/api/v2'
  }
  return base + (path || '')
}
