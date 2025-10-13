import { useRuntimeConfig } from 'nuxt/app'

export const useStationEditorApiEndpoint = (path?: string) => {
  const config = useRuntimeConfig()
  // Use stationEditorApiBase if configured, otherwise fall back to regular apiBase
  const apiBase = config.public.tlv2?.stationEditorApiBase || config.public.tlv2?.apiBase || (typeof window !== 'undefined' ? window.location.origin + '/api/v2' : '')
  return apiBase + (path || '')
}
