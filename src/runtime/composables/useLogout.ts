import { navigateTo, useRuntimeConfig } from '#imports'
import { getLogoutUrl } from '../lib/auth0'
import { logAuthDebug } from '../lib/log'
import { createMixpanel } from '../lib/mixpanel'
import { useUser } from './useUser'

// Logout
export const useLogout = async () => {
  logAuthDebug('useLogout')
  // Reset Mixpanel before redirecting
  const config = useRuntimeConfig()
  const mixpanel = createMixpanel(config.public.tlv2?.mixpanelApikey, useUser())
  mixpanel.reset()
  return navigateTo(await getLogoutUrl(), { external: true })
}
