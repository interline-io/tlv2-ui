import { defineNuxtPlugin, useRuntimeConfig } from '#imports'

/**
 * Client-side migration plugin: detects Auth0 SPA SDK tokens in localStorage
 * and migrates them to HttpOnly cookies via the /api/auth/migrate endpoint.
 * Runs once on first page load when serverAuth is enabled.
 * After successful migration, clears the Auth0 SPA SDK cache from localStorage.
 */
export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const clientId = config.public.tlv2?.auth0ClientId

  if (!clientId) {
    return
  }

  // Find Auth0 SPA SDK access token in localStorage
  const token = findAuth0Token(clientId as string)
  if (!token) {
    return
  }

  try {
    const response = await $fetch('/api/auth/migrate', {
      method: 'POST',
      body: { token },
    })

    if ((response as any)?.migrated) {
      // Successfully migrated — clean up Auth0 SPA SDK localStorage entries
      clearAuth0Storage(clientId as string)
      // Reload to pick up the new cookie-based auth state
      window.location.reload()
    }
  } catch {
    // Migration failed (token expired/invalid) — clear stale localStorage
    clearAuth0Storage(clientId as string)
  }
})

/**
 * Find an access_token from Auth0 SPA SDK localStorage cache.
 * The SDK stores cache entries with keys like:
 *   @@auth0spajs@@::<clientId>::<audience>::<scope>
 */
function findAuth0Token (clientId: string): string | null {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith('@@auth0spajs@@')) {
        continue
      }
      // Match keys containing our clientId
      if (!key.includes(`::${clientId}::`)) {
        continue
      }
      const raw = localStorage.getItem(key)
      if (!raw) {
        continue
      }
      const data = JSON.parse(raw)
      const accessToken = data?.body?.access_token
      if (accessToken && typeof accessToken === 'string') {
        return accessToken
      }
    }
  } catch {
    // localStorage unavailable or parse error
  }
  return null
}

/**
 * Remove all Auth0 SPA SDK entries and the legacy user storage from localStorage.
 */
function clearAuth0Storage (clientId: string) {
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) { continue }
      if (key.startsWith('@@auth0spajs@@') || key === `a0.spajs.txs.${clientId}`) {
        keysToRemove.push(key)
      }
    }
    for (const key of keysToRemove) {
      localStorage.removeItem(key)
    }
    // Also clear the legacy useStorage('user') entry
    localStorage.removeItem('user')
  } catch {
    // localStorage unavailable
  }
}
