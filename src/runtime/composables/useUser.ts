import { useUser as useUserClient } from '../libnuxt/user.client'
import { User } from '../lib/user'

export function useUser () {
  if (process.server) {
    return new User({})
  }
  return useUserClient()
}
