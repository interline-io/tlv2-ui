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
    console.log('useLoginGate: login gate disabled')
    return false
  }
  // Get user
  const user = useUser()
  if (!user.loggedIn) {
    // Not logged in: not authorized
    console.log('useLoginGate: not logged in')
    return true
  }

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
      return true
    }
  }

  if (hasRoleCopy.length === 0) {
    // No roles required: authorized
    return false
  }

  for (const r of hasRoleCopy || []) {
    if (user.hasRole(r)) {
      // Has one of the hasAnyRole: authorized
      return false
    }
  }
  return true
}
