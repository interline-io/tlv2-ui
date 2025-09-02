import { User } from '../lib/user'

export const useUser = (): User => {
  return new User({})
}
