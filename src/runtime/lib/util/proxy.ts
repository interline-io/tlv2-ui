import type { H3Event } from 'h3'
import { proxyRequest, getQuery, createError } from 'h3'
import { buildProxyTarget, buildProxyHeaders } from './proxy-route'

// Server-side proxy that forwards requests to backend services
// with authentication headers attached.
export async function proxyHandler (
  event: H3Event,
  proxyBase: string,
  graphqlApikey: string,
  accessToken?: string,
  pathOverride?: string
) {
  if (!proxyBase || proxyBase === 'undefined') {
    throw createError({
      statusCode: 500,
      message: '[tlv2-ui] Proxy base URL is not configured. Set the NUXT_TLV2_PROXY_BASE_DEFAULT (or client-specific) environment variable, or configure runtimeConfig.tlv2.proxyBase in nuxt.config.ts.'
    })
  }

  const query = getQuery(event)
  const requestApikey = (query.apikey ? query.apikey.toString() : '') || event.headers.get('apikey') || ''
  const headers = buildProxyHeaders(graphqlApikey, accessToken, requestApikey)
  const target = buildProxyTarget(proxyBase, pathOverride ?? event.path)

  return proxyRequest(event, target, {
    fetchOptions: {
      redirect: 'manual'
    },
    headers
  })
}
