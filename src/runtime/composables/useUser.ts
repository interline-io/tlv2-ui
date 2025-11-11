// Backwards-compatible shim for useUser - delegates to useUserState
import { computed } from '#imports'
import { useUserState } from './useUserState'
import type { User } from '../auth/user'

// Backwards compatible user function that returns reactive properties
export const useUser = () => {
  const { user, loadUser } = useUserState()

  // Load user data on first call
  loadUser()

  // Return reactive properties for backwards compatibility
  return {
    loggedIn: computed(() => user.value?.loggedIn ?? false),
    id: computed(() => user.value?.id ?? ''),
    name: computed(() => user.value?.name ?? ''),
    email: computed(() => user.value?.email ?? ''),
    roles: computed(() => user.value?.roles ?? []),
    externalData: computed(() => user.value?.externalData ?? {}),
    checked: computed(() => user.value?.checked ?? 0),
    hasRole: (role: string) => user.value?.hasRole(role) ?? false
  }
}

// Async version for when you need a promise
export const useUserAsync = async (): Promise<User> => {
  const { loadUser } = useUserState()
  return await loadUser()
}

// Synchronous version for when you know user is already loaded
export const useUserSync = (): User => {
  const { getUserSync } = useUserState()
  return getUserSync()
}

// Clear user data and auth cookie
export const clearUser = () => {
  const { clearUser } = useUserState()
  clearUser()
}
