import { navigateTo, useRuntimeConfig } from '#imports'
import { logAuthDebug } from '../lib/util/log'
import { createMixpanel } from '../lib/analytics/mixpanel'
import { useUser } from './useUser'

// Logout — redirects to server logout route which clears cookie and redirects to Auth0
export const useLogout = async () => {
  logAuthDebug('useLogout')
  const config = useRuntimeConfig()
  const mixpanel = createMixpanel(config.public.tlv2?.mixpanelApikey, useUser())
  mixpanel.reset()
  return navigateTo('/api/auth/logout', { external: true })
}
