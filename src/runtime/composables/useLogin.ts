import { useRuntimeConfig } from '#imports'
import { useLogin as useServerLogin } from '../auth/server/useLogin'
import { useLogin as useSpaLogin } from '../auth/spa/useLogin'

export const useLogin = async (targetUrl: null | string) => {
  const config = useRuntimeConfig()
  return config.public.tlv2?.authMode === 'spa'
    ? useSpaLogin(targetUrl)
    : useServerLogin(targetUrl)
}
