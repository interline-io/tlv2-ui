import { navigateTo, useRoute } from '#imports'
import { getAuthorizeUrl } from './auth0'
import { logAuthDebug } from '../../lib/util/log'

export const useLogin = async (targetUrl: null | string) => {
  logAuthDebug('useLogin')
  const route = useRoute()
  targetUrl = targetUrl || route.fullPath
  return navigateTo(await getAuthorizeUrl(targetUrl), { external: true })
}
