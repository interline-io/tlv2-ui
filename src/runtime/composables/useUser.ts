import { useRuntimeConfig } from '#imports'
import { useUser as useServerUser } from '../auth/server/useUser'
import { useUser as useSpaUser } from '../auth/spa/useUser'
import type { TlUser } from '../auth/shared/types'

export const useUser = (): TlUser => {
  const config = useRuntimeConfig()
  return config.public.tlv2?.authMode === 'spa' ? useSpaUser() : useServerUser()
}
