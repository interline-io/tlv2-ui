import { useUser } from '../plugins/auth'
import { useRuntimeConfig } from '#imports'

export const useLoginGate = (role?: string):boolean => {
  // console.log('useLoginGate')
  const config = useRuntimeConfig()
  // console.log(config.public.loginGate)
  if (config.public.loginGate) {
    // console.log('useLoginGate: config is true')
    const user = useUser()
    if (user?.loggedIn) {
      // console.log('user??', user, 'role:', role, 'has role:', user.hasRole(role))
      // console.log('useLoginGate: user is logged in')
      if (role) {
        return !user.hasRole(role)
      }
      return false
    }
    // console.log('useLoginGate: user not logged in, login required')
    return true
  }
  return false
}
