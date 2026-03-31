// Pure functions for proxy route parsing — no framework dependencies.

// Extract backend name from proxy path: /api/proxy/{backend}/...
export function parseProxyRoute (path: string): { backendName: string, strippedPath: string } {
  const match = path.match(/^\/api\/proxy\/([^/]+)/)
  const backendName = match?.[1] || 'default'
  const strippedPath = path.replace(/^\/api\/proxy\/[^/]+/, '') || '/'
  return { backendName, strippedPath }
}

// Resolve the backend name to a proxyBase URL, or null if unknown.
export function resolveProxyBase (
  backendName: string,
  proxyBases: Record<string, string>
): string | null {
  return proxyBases[backendName] || null
}

// Build the target URL from proxyBase and the stripped request path.
export function buildProxyTarget (proxyBase: string, requestPath: string): string {
  const proxyBaseUrl = new URL(proxyBase)
  const proxyBasePathname = proxyBaseUrl.pathname === '/' ? '' : proxyBaseUrl.pathname
  const newPath = proxyBasePathname + requestPath
  return new URL(newPath, proxyBaseUrl.toString()).toString()
}

// Build auth headers for the proxied request.
export function buildProxyHeaders (
  graphqlApikey: string,
  accessToken?: string,
  requestApikey?: string
): Record<string, string> {
  const headers: Record<string, string> = {
    apikey: requestApikey || graphqlApikey
  }
  if (accessToken) {
    headers.authorization = `Bearer ${accessToken}`
  }
  return headers
}
