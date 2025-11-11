import { navigateTo, useRuntimeConfig } from '#imports'
import { getLogoutUrl } from '../lib/auth0'
import { logAuthDebug } from '../lib/log'
import { createMixpanel } from '../lib/mixpanel'
import { useUserState } from './useUserState'

// Logout
export const useLogout = async () => {
  logAuthDebug('useLogout')
  // Reset Mixpanel before redirecting
  const config = useRuntimeConfig()
  const { user } = await useUserState()
  const mixpanel = createMixpanel(config.public.tlv2?.mixpanelApikey, user)
  mixpanel.reset()
  return navigateTo(await getLogoutUrl(), { external: true })
}
