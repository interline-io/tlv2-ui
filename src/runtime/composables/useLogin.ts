import { navigateTo, useRoute } from '#imports'
import { logAuthDebug } from '../lib/util/log'

// Login — redirects to server login route which initiates Auth0 flow
export const useLogin = async (targetUrl: null | string) => {
  logAuthDebug('useLogin')
  const route = useRoute()
  targetUrl = targetUrl || route.fullPath
  return navigateTo(`/api/auth/login?returnTo=${encodeURIComponent(targetUrl)}`, { external: true })
}
