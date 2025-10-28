import { useRuntimeConfig } from '#imports'
import { useUser } from './useUser'

/// ////////////////////
// User
/// ////////////////////

export const useLoginGate = (options: { hasRole?: string, hasAnyRole?: string[], excludeAnyRole?: string[] }): boolean => {
  // Returns TRUE if GATE REQUIRED
  // Get config
  const config = useRuntimeConfig()
  if (!config.public.tlv2?.loginGate) {
    // Login gate disabled: always authorized
    console.log('useLoginGate: (not gated) login gate disabled')
    return false
  }
  // Get user
  const user = useUser()
  if (!user.loggedIn) {
    // Not logged in: not authorized
    console.log('useLoginGate: (gated) not logged in')
    return true
  }

  console.log('useLoginGate: checking login gate with options', options, 'user roles:', user.roles)
  // Combine options
  let { hasRole, hasAnyRole, excludeAnyRole } = options
  const hasRoleCopy = [...hasAnyRole || []]
  if (hasRole) {
    hasRoleCopy.push(hasRole)
  }

  // Check exclusions and roles
  for (const excludeRole of excludeAnyRole || []) {
    if (user.hasRole(excludeRole)) {
      // Has an excluded role: not authorized
      console.log('useLoginGate: (gated) has excluded role', excludeRole)
      return true
    }
  }

  if (hasRoleCopy.length === 0) {
    // No roles required: authorized
    console.log('useLoginGate: (not gated) no roles required')
    return false
  }

  for (const r of hasRoleCopy || []) {
    if (user.hasRole(r)) {
      // Has one of the hasAnyRole: authorized
      console.log('useLoginGate: (not gated) user has required role', r)
      return false
    }
  }
  // Does not have any of the required roles: not authorized
  console.log('useLoginGate: (gated) user does not have any of the required roles', hasRoleCopy)
  return true
}
