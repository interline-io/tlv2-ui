import type { H3Event } from 'h3'
import { proxyRequest, getQuery, createError } from 'h3'

// Server-side proxy that forwards requests to backend services
// with authentication headers attached.
export async function proxyHandler (
  event: H3Event,
  proxyBase: string,
  graphqlApikey: string,
  accessToken?: string,
  pathOverride?: string
) {
  // Check user provided apikey
  const query = getQuery(event)
  const requestApikey = (query.apikey ? query.apikey.toString() : '') || event.headers.get('apikey') || ''

  // Auth headers
  const headers: Record<string, string> = {
    apikey: requestApikey || graphqlApikey
  }
  if (accessToken) {
    headers.authorization = `Bearer ${accessToken}`
  }

  // Proxy request
  if (!proxyBase || proxyBase === 'undefined') {
    throw createError({
      statusCode: 500,
      message: '[tlv2-ui] Proxy base URL is not configured. Set the NUXT_TLV2_PROXY_BASE_DEFAULT (or client-specific) environment variable, or configure runtimeConfig.tlv2.proxyBase in nuxt.config.ts.'
    })
  }
  const proxyBaseUrl = new URL(proxyBase)
  const proxyBasePathname = proxyBaseUrl.pathname === '/' ? '' : proxyBaseUrl.pathname
  const newPath = proxyBasePathname + (pathOverride ?? event.path)
  const target = new URL(
    newPath,
    proxyBaseUrl.toString()
  )
  return proxyRequest(event, target.toString(), {
    fetchOptions: {
      redirect: 'manual'
    },
    headers
  })
}
