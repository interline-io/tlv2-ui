import { useMixpanel } from './useMixpanel'
import { useLogout as authLogout } from '../auth/server/useLogout'

export const useLogout = async () => {
  useMixpanel().reset()
  return authLogout()
}
