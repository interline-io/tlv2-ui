import { navigateTo, useRoute, useRuntimeConfig } from '#imports'
import { getAuthorizeUrl } from '../lib/auth/auth0'
import { logAuthDebug } from '../lib/util/log'

// Login
export const useLogin = async (targetUrl: null | string) => {
  logAuthDebug('useLogin')
  const route = useRoute()
  targetUrl = targetUrl || route.fullPath

  const config = useRuntimeConfig()
  const serverAuth = !!(config.public.tlv2 as any)?.serverAuth

  if (serverAuth) {
    // Server auth mode: redirect to server login route
    return navigateTo(`/api/auth/login?returnTo=${encodeURIComponent(targetUrl)}`, { external: true })
  }

  // Client auth mode: redirect to Auth0 directly via SPA SDK
  return navigateTo(await getAuthorizeUrl(targetUrl), { external: true })
}
