// In server auth mode, auth headers are not needed client-side.
// The server proxy extracts the JWT from the auth0-nuxt session
// and attaches it to backend requests automatically.
export const useAuthHeaders = async (): Promise<Record<string, string>> => {
  return {}
}
