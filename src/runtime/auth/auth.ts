import { useRuntimeConfig } from '#imports'
import { User } from './user'

/// ////////////////////
// Composables
/// ////////////////////

// Headers, including CSRF
export const useAuthHeaders = async (): Promise<Record<string, string>> => {
  const config = useRuntimeConfig()
  if (config.public.tlv2?.authCheck) {
    const { headers } = await config.public.tlv2.authCheck()
    return headers
  }
  return {}
}

export const useApiEndpoint = (path?: string): string => {
  const config = useRuntimeConfig()
  const apiBase = import.meta.server
    ? (config.tlv2?.proxyBase)
    : (config.public.tlv2?.apiBase || window?.location?.origin + '/api/v2')
  return apiBase + (path || '')
}

export const useUser = async (): Promise<User> => {
  const config = useRuntimeConfig()
  if (config.public.tlv2?.authCheck) {
    const { user } = await config.public.tlv2.authCheck()
    return user
  }
  return new User({ loggedIn: false })
}
export const clearUser = async (): Promise<void> => {
  const config = useRuntimeConfig()
  if (config.public.tlv2?.clearUser) {
    return await config.public.tlv2.clearUser()
  }
  return
}

export const useLoginGate = async (role?: string): Promise<boolean> => {
  // console.log('useLoginGate')
  const config = useRuntimeConfig()
  if (config.public.tlv2?.loginGate) {
    // console.log('useLoginGate: config is true')
    const user = await useUser()
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
