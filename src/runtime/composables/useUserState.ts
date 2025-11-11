// Composable for reactive user state - now contains the main user management logic
import { useCookie } from '#imports'
import { useStorage } from '@vueuse/core'
import { useApolloClient } from '@vue/apollo-composable'
import { gql } from 'graphql-tag'
import { User, type UserData } from '../auth/user'

// const CACHE_DURATION = 600_000 // 10 minutes

export const useUserState = async () => {
  // Get user from local storage if available
  const anonUser = new User({ loggedIn: false })
  const localStorageUser = useStorage('user', anonUser)
  if (localStorageUser.loggedIn) {
    return {
      user: localStorageUser.value,
      clearUserData
    }
  }

  const newUser = await fetchUserFromGraphQL()
  useStorage('user', newUser)
  return {
    user: newUser,
    clearUserData
  }
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

// Clear user data and auth cookie (moved from useUser)
const clearUserData = () => {
  const checkUser = useStorage('user', {})
  checkUser.value = new User({ loggedIn: false }) as any

  // Clear the auth cookie for SSR as well
  if (import.meta.client) {
    const authCookie = useCookie('auth-token')
    // @ts-expect-error - useCookie typing issue
    authCookie.value = null
  }
}
