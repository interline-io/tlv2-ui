import { navigateTo, useRoute } from '#imports'
import { getAuthorizeUrl } from '../lib/auth/auth0'
import { logAuthDebug } from '../lib/util/log'

// Login
export const useLogin = async (targetUrl: null | string) => {
  logAuthDebug('useLogin')
  // Get current route's full path if no targetUrl provided
  const route = useRoute()
  targetUrl = targetUrl || route.fullPath
  return navigateTo(await getAuthorizeUrl(targetUrl), { external: true })
}
