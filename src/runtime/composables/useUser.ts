import { useState } from '#imports'
import { User } from '../lib/auth/user'

export const useUser = () => {
  const userState = useState<Record<string, any>>('tlv2_user', () => ({}))
  return new User(userState.value || {})
}
