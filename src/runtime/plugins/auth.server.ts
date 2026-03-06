import { defineNuxtPlugin, useState, useRequestEvent } from '#imports'
import { User } from '../lib/auth/user'

// Server-side auth plugin: transfers event.context.auth (set by JWT middleware)
// into useState so useUser() works identically on server and client via SSR payload.
export default defineNuxtPlugin(() => {
  const event = useRequestEvent()
  const auth = event?.context?.auth
  const userState = useState<Record<string, any>>('tlv2_user', () => ({}))

  if (auth) {
    userState.value = {
      loggedIn: true,
      id: '',
      name: '',
      email: auth.email || '',
      roles: auth.permissions || [],
      externalData: {},
      sub: auth.sub || '',
    }
  } else {
    userState.value = new User({ loggedIn: false })
  }
})
