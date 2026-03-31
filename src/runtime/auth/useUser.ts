import { useState } from '#imports'
import type { Ref } from 'vue'
import type { TlUser } from '../shared/types'

// auth0-nuxt populates useState('auth0_user') with OIDC claims
const useAuth0User = () => useState<Record<string, any> | undefined>('auth0_user')

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
    id: graphqlId.value || auth0User.value?.tlv2_id || auth0User.value?.sub || '',
    name: auth0User.value?.name || auth0User.value?.tlv2_name || '',
    email: auth0User.value?.email || auth0User.value?.tlv2_email || '',
    roles: roles.value,
    hasRole (v: string): boolean {
      return roles.value.includes(v)
    }
  }
}
