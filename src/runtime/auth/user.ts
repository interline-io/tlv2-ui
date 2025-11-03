import { useStorage } from '@vueuse/core'

const RECHECK_INTERVAL = 600_000
const buildGraphqlUser = true

export class User {
  loggedIn = false
  id = ''
  name = ''
  email = ''
  roles = []
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

export const useUser = () => {
  const user = useStorage('user', {})
  return new User(user?.value || {})
}
