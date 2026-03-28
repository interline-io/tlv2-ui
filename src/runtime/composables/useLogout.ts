import { useRuntimeConfig } from '#imports'
import { createMixpanel } from '../lib/analytics/mixpanel'
import { useUser } from './useUser'
import { useLogout as useServerLogout } from '../auth/server/useLogout'
import { useLogout as useSpaLogout } from '../auth/spa/useLogout'

export const useLogout = async () => {
  // Reset Mixpanel before redirecting
  const config = useRuntimeConfig()
  const mixpanel = createMixpanel(config.public.tlv2?.mixpanelApikey, useUser())
  mixpanel.reset()

  return config.public.tlv2?.authMode === 'spa'
    ? useSpaLogout()
    : useServerLogout()
}
