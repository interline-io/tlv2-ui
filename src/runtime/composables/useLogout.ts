import { navigateTo, useRuntimeConfig } from '#imports'
import { createMixpanel } from '../lib/analytics/mixpanel'
import { useUser } from './useUser'

export const useLogout = async () => {
  // Reset Mixpanel before redirecting
  const config = useRuntimeConfig()
  const mixpanel = createMixpanel(config.public.tlv2?.mixpanelApikey, useUser())
  mixpanel.reset()
  return navigateTo('/auth/logout', { external: true })
}
