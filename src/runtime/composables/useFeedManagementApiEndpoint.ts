import { useRuntimeConfig } from 'nuxt/app'

export const useFeedManagementApiEndpoint = (path?: string) => {
  const config = useRuntimeConfig()
  // Fallback chain: feedManagementApiBase → stationEditorApiBase → apiBase
  const tlv2Config = config.public.tlv2 as any
  const apiBase = tlv2Config?.feedManagementApiBase
    || tlv2Config?.stationEditorApiBase
    || tlv2Config?.apiBase
    || (typeof window !== 'undefined' ? window.location.origin + '/api/v2' : '')
  return apiBase + (path || '')
}
