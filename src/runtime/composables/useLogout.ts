import { navigateTo, useRuntimeConfig } from '#imports'
import { getLogoutUrl } from '../lib/auth/auth0'
import { logAuthDebug } from '../lib/util/log'
import { createMixpanel } from '../lib/analytics/mixpanel'
import { useUser } from './useUser'

// Logout
export const useLogout = async () => {
  logAuthDebug('useLogout')
  // Reset Mixpanel before redirecting
  const config = useRuntimeConfig()
  const mixpanel = createMixpanel(config.public.tlv2?.mixpanelApikey, useUser())
  mixpanel.reset()

  const serverAuth = !!(config.public.tlv2 as any)?.serverAuth

  if (serverAuth) {
    // Server auth mode: redirect to server logout route (clears cookie, redirects to Auth0 logout)
    return navigateTo('/api/auth/logout', { external: true })
  }

  // Client auth mode: redirect to Auth0 logout via SPA SDK
  return navigateTo(await getLogoutUrl(), { external: true })
}
