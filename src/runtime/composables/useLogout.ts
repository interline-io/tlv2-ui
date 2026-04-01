import { useMixpanel } from './useMixpanel'
import { useLogout as authLogout } from '../auth/useLogout'

export const useLogout = async () => {
  useMixpanel().reset()
  return authLogout()
}
