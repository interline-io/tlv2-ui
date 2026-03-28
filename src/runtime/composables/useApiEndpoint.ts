import { useRuntimeConfig } from '#imports'

export const useApiEndpoint = (path?: string, clientName?: string) => {
  clientName = clientName || 'default'
  let base = ''
  const config = useRuntimeConfig()
  if (import.meta.server) {
    // Server-side: use the direct backend URL (proxyBase)
    const proxyBases: Record<string, string> = config.tlv2?.proxyBase || {}
    base = (proxyBases[clientName] || '')
  }
  if (typeof window !== 'undefined') {
    // Client-side: always go through the local proxy
    base = window.location.origin + '/api/v2'
  }
  return base + (path || '')
}
