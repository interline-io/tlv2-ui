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
  if (import.meta.client) {
    // Client-side: route through the per-backend proxy
    base = window.location.origin + '/api/proxy/' + clientName
  }
  return base + (path || '')
}
