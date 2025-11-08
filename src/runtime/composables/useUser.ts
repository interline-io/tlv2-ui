// Nuxt composable for user management
import { useStorage } from '@vueuse/core'
import { useCookie } from '#imports'
import { useApolloClient } from '@vue/apollo-composable'
import { gql } from 'graphql-tag'
import { User, type UserData } from '../auth/user'

// Promise to track ongoing user fetch
let userFetchPromise: Promise<User> | null = null

const CACHE_DURATION = 600_000 // 10 minutes

export const useUser = async (): Promise<User> => {
  const userStorage = useStorage('user', {})
  const existingUser = new User(userStorage?.value || {})

  // Check if we have cached user data that's still fresh
  const now = Date.now()
  if (existingUser.loggedIn && existingUser.checked && (now - existingUser.checked) < CACHE_DURATION) {
    return existingUser
  }

  // If already fetching, return the existing promise
  if (userFetchPromise) {
    return userFetchPromise
  }

  // Start fetching user data
  userFetchPromise = fetchUserFromGraphQL()

  try {
    const user = await userFetchPromise
    userStorage.value = user
    return user
  } finally {
    userFetchPromise = null
  }
}

// Synchronous version for when you know user is already loaded
export const useUserSync = (): User => {
  const user = useStorage('user', {})
  return new User(user?.value || {})
}

// Clear user data and auth cookie
export const clearUser = () => {
  const checkUser = useStorage('user', {})
  checkUser.value = new User({ loggedIn: false })

  // Clear the auth cookie for SSR as well
  if (import.meta.client) {
    const authCookie = useCookie('auth-token')
    authCookie.value = null
  }

  // Reset any ongoing fetch promise
  userFetchPromise = null
}

// Fetch user from GraphQL me resolver
async function fetchUserFromGraphQL (): Promise<User> {
  if (import.meta.server) {
    // On server, we can't make GraphQL calls in this context
    // Return empty user and let client-side handle it
    return new User({ loggedIn: false })
  }

  try {
    const apolloClient = useApolloClient()
    const response = await apolloClient.client.query({
      query: gql`query GetMe { me { id name email external_data roles } }`,
      fetchPolicy: 'network-only' // Always fetch fresh data
    })

    const meData: UserData | null = response.data?.me

    if (meData) {
      return new User({
        loggedIn: true,
        id: meData.id || '',
        name: meData.name || '',
        email: meData.email || '',
        externalData: meData.external_data || {},
        roles: meData.roles || [],
        checked: Date.now()
      })
    } else {
      return new User({ loggedIn: false })
    }
  } catch (error) {
    console.warn('Failed to fetch user:', error)
    return new User({ loggedIn: false })
  }
}
