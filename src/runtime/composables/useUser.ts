import { useState, useRuntimeConfig } from '#imports'
import { useStorage } from '@vueuse/core'
import { User } from '../lib/auth/user'

export const useUser = () => {
  const config = useRuntimeConfig()
  const serverAuth = !!(config.public.tlv2 as any)?.serverAuth

  if (serverAuth) {
    // Server auth mode: read from useState (populated by auth.server.ts plugin via SSR payload)
    const userState = useState<Record<string, any>>('tlv2_user', () => ({}))
    return new User(userState.value || {})
  }

  // Client auth mode: read from localStorage (populated by auth.client.ts plugin)
  const user = useStorage('user', {})
  return new User(user?.value || {})
}
