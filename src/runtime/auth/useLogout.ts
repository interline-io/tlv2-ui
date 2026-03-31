import { navigateTo } from '#imports'

export const useLogout = async () => {
  return navigateTo('/auth/logout', { external: true })
}
