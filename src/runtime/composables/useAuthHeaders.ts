// Auth headers are no longer needed client-side.
// The server proxy (proxy.ts) extracts the JWT from the auth0-nuxt session
// and attaches it to backend requests automatically.
// This stub is kept for backwards compatibility during migration.
export const useAuthHeaders = async (): Promise<Record<string, string>> => {
  return {}
}
