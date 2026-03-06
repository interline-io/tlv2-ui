import type { H3Event } from 'h3'
import { proxyRequest, getQuery, getCookie } from 'h3'

// Use sessions and/or nuxt-csurf to protect this in nuxt.config.ts
export function proxyHandler (
  event: H3Event,
  proxyBase: string,
  graphqlApikey: string
) {
  // Upstream auth precedence:
  // 1. Authorization header (client auth mode sends Bearer token directly)
  // 2. tlv2_auth_token cookie (server auth mode stores JWT in HttpOnly cookie)
  // 3. Fall back to apikey for unauthenticated users
  const requestBearer = event.headers.get('authorization') || ''
  const cookieToken = !requestBearer ? getCookie(event, 'tlv2_auth_token') : ''
  const authorization = requestBearer || (cookieToken ? `Bearer ${cookieToken}` : '')

  const headers: Record<string, string> = {}
  if (authorization) {
    headers.authorization = authorization
  } else {
    // No JWT available — use apikey for unauthenticated access
    const query = getQuery(event)
    const requestApikey = (query.apikey ? query.apikey.toString() : '') || event.headers.get('apikey') || ''
    headers.apikey = requestApikey || graphqlApikey
  }

  // Proxy request
  const proxyBaseUrl = new URL(proxyBase)
  const proxyBasePathname = proxyBaseUrl.pathname === '/' ? '' : proxyBaseUrl.pathname
  const newPath = proxyBasePathname + event.path.replace('/api/v2', '')
  const target = new URL(
    newPath,
    proxyBaseUrl.toString()
  )
  // console.log('proxy:', {
  //   eventPath: event.path,
  //   eventHeaders: Object.fromEntries(event.headers.entries()),
  //   proxyBaseUrl: proxyBaseUrl.toString(),
  //   target: target.toString(),
  //   headers: headers
  // })
  return proxyRequest(event, target.toString(), {
    fetchOptions: {
      redirect: 'manual'
    },
    headers
  })
}
