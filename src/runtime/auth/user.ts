// Pure TypeScript User class and interfaces
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

export interface UserData {
  id?: string
  name?: string
  email?: string
  external_data?: any
  roles?: string[]
}
