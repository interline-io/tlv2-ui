import { defineNuxtPlugin, useCsrf } from '#imports'

// Global CSRF header injection for all client-side requests.
// Overrides globalThis.$fetch so useFetch/$fetch get CSRF automatically.
// Exports a wrapped globalThis.fetch for Apollo's createUploadLink.
export default defineNuxtPlugin(() => {
  const { csrf, headerName } = useCsrf()

  // Override $fetch (ofetch) — covers useFetch, $fetch, fetchAdmin, etc.
  globalThis.$fetch = globalThis.$fetch.create({
    onRequest ({ options }) {
      options.headers = new Headers(options.headers || {})
      options.headers.append(headerName, csrf)
    }
  })

  // Wrap globalThis.fetch — covers Apollo's createUploadLink
  const originalFetch = globalThis.fetch
  globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    init = init || {}
    const headers = new Headers(init.headers || {})
    headers.append(headerName, csrf)
    init.headers = headers
    return originalFetch(input, init)
  }
})
