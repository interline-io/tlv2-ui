import { useCsrf } from '#imports'

// In server auth mode, the proxy extracts the JWT from the auth0-nuxt session
// automatically. Client-side requests only need CSRF headers.
export const useAuthHeaders = async (): Promise<Record<string, string>> => {
  if (import.meta.client) {
    const { headerName, csrf } = useCsrf()
    return { [headerName]: csrf }
  }
  return {}
}
