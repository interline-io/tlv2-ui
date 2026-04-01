import { defineNuxtPlugin, useCsrf } from '#imports'

function isSameOrigin (url: string | URL | Request): boolean {
  const target = url instanceof Request ? url.url : String(url)
  // Only absolute http(s) URLs can be cross-origin;
  // relative paths, protocol-relative, and everything else stay same-origin.
  if (!target.startsWith('http://') && !target.startsWith('https://')) return true
  return new URL(target).origin === window.location.origin
}

// Global CSRF header injection for same-origin client-side requests only.
// Custom headers on cross-origin requests trigger CORS preflights, which
// breaks external resources like map tiles.
// Overrides globalThis.$fetch so useFetch/$fetch get CSRF automatically.
// Exports a wrapped globalThis.fetch for Apollo's createUploadLink.
export default defineNuxtPlugin(() => {
  const { csrf, headerName } = useCsrf()

  // Override $fetch (ofetch) — covers useFetch, $fetch, fetchAdmin, etc.
  globalThis.$fetch = globalThis.$fetch.create({
    onRequest ({ options }) {
      if (!options.baseURL && isSameOrigin(options.url || '/')) {
        options.headers = new Headers(options.headers || {})
        options.headers.append(headerName, csrf)
      }
    }
  })

  // Wrap globalThis.fetch — covers Apollo's createUploadLink
  const originalFetch = globalThis.fetch
  globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (isSameOrigin(input)) {
      init = init || {}
      const headers = new Headers(init.headers || {})
      headers.append(headerName, csrf)
      init.headers = headers
    }
    return originalFetch(input, init)
  }
})
