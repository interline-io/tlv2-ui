// Composable for reactive user state
import { ref, computed } from 'vue'
import { useUser, useUserSync, clearUser } from './useUser'
import type { User } from '../auth/user'

// Global reactive user state
const userState = ref<User | null>(null)
const isLoading = ref(false)
const hasLoaded = ref(false)

export const useUserState = () => {
  // Load user data if not already loaded or loading
  const loadUser = async () => {
    if (isLoading.value || hasLoaded.value) return

    isLoading.value = true
    try {
      const user = await useUser()
      userState.value = user
      hasLoaded.value = true
    } catch (error) {
      console.error('Failed to load user:', error)
      userState.value = null
    } finally {
      isLoading.value = false
    }
  }

  // Get user synchronously if already loaded
  const getUserSync = () => {
    if (hasLoaded.value) {
      return userState.value
    }
    return useUserSync()
  }

  // Clear user state
  const clearUserState = () => {
    clearUser()
    userState.value = null
    hasLoaded.value = false
    isLoading.value = false
  }

  // Auto-load user on first access
  if (!hasLoaded.value && !isLoading.value) {
    loadUser()
  }

  return {
    user: computed(() => userState.value),
    isLoading: computed(() => isLoading.value),
    hasLoaded: computed(() => hasLoaded.value),
    loadUser,
    getUserSync,
    clearUser: clearUserState
  }
}
