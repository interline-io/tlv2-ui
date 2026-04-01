export interface TlUser {
  loggedIn: boolean
  id: string
  name: string
  email: string
  roles: string[]
  hasRole: (v: string) => boolean
}
