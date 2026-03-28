import { useState } from '#imports'
import type { Ref } from 'vue'

// auth0-nuxt provides useUser() which returns Ref<UserClaims | undefined>.
// We import it under a different name to avoid collision with our own useUser().
const useAuth0User = () => useState<Record<string, any> | undefined>('auth0_user')

export interface TlUser {
  loggedIn: boolean
  id: string
  name: string
  email: string
  roles: string[]
  hasRole: (v: string) => boolean
}

// Shared state for roles fetched from the GraphQL `me` endpoint
export const useUserRoles = (): Ref<string[]> => {
  return useState<string[]>('tlv2_user_roles', () => [])
}

export const useUserGraphqlId = (): Ref<string> => {
  return useState<string>('tlv2_user_id', () => '')
}

export const useUser = (): TlUser => {
  const auth0User = useAuth0User()
  const roles = useUserRoles()
  const graphqlId = useUserGraphqlId()

  const loggedIn = !!auth0User.value
  return {
    loggedIn,
    id: graphqlId.value || auth0User.value?.sub || '',
    name: auth0User.value?.name || '',
    email: auth0User.value?.email || '',
    roles: roles.value,
    hasRole (v: string): boolean {
      return roles.value.includes(v)
    }
  }
}

export function clearUser () {
  const roles = useUserRoles()
  const graphqlId = useUserGraphqlId()
  roles.value = []
  graphqlId.value = ''
}
