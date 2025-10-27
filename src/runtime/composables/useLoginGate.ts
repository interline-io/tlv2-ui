import { useRuntimeConfig } from '#imports'
import { useUser } from './useUser'

/// ////////////////////
// User
/// ////////////////////

export const useLoginGate = (role?: string): boolean => {
  const config = useRuntimeConfig()
  if (config.public.tlv2?.loginGate) {
    const user = useUser()
    if (user?.loggedIn) {
      if (role) {
        return !user.hasRole(role)
      }
      return false
    }
    return true
  }
  return false
}
