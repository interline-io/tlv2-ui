import { navigateTo } from '#imports'
import { getLogoutUrl } from './auth0'

export const useLogout = async () => {
  return navigateTo(await getLogoutUrl(), { external: true })
}
