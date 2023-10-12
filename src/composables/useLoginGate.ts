import { useUser } from '../plugins/auth'

export const useLoginGate = () => {
  // console.log('useLoginGate')
  const config = useRuntimeConfig()
  console.log(config.public.loginGate)
  if (config.public.loginGate) {
    // console.log('useLoginGate: config is true')
    const user = useUser()
    if (user?.value?.loggedIn) {
      // console.log('useLoginGate: user is logged in')
      return false
    }
    // console.log('useLoginGate: user not logged in, login required')
    return true
  }
  return false
}
