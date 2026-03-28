import { navigateTo, useRoute } from '#imports'

export const useLogin = async (targetUrl: null | string) => {
  const route = useRoute()
  targetUrl = targetUrl || route.fullPath
  return navigateTo('/auth/login?returnTo=' + encodeURIComponent(targetUrl), { external: true })
}
