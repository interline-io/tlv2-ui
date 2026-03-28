import { useRuntimeConfig } from '#imports'
import { useAuthHeaders as useServerAuthHeaders } from '../auth/server/useAuthHeaders'
import { useAuthHeaders as useSpaAuthHeaders } from '../auth/spa/useAuthHeaders'

export const useAuthHeaders = async (): Promise<Record<string, string>> => {
  const config = useRuntimeConfig()
  return config.public.tlv2?.authMode === 'spa'
    ? useSpaAuthHeaders()
    : useServerAuthHeaders()
}
