import { useStorage } from '@vueuse/core'
import type { TlUser } from '../shared/types'

export class User implements TlUser {
  loggedIn = false
  id = ''
  name = ''
  email = ''
  roles: string[] = []
  externalData = {}
  checked = 0
  constructor (v: any) {
    Object.assign(this, v)
  }

  hasRole (v: string): boolean {
    for (const s of this.roles) {
      if (s === v) {
        return true
      }
    }
    return false
  }
}

export function clearUser () {
  const checkUser = useStorage('user', {})
  checkUser.value = new User({ loggedIn: false })
}

export const useUser = (): TlUser => {
  const user = useStorage('user', {})
  return new User(user?.value || {})
}
