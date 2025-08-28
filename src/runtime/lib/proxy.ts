import { proxyRequest, getQuery, H3Event } from 'h3'
import { sanitizeStringify } from './sanitize-log'

// Use sessions and/or nuxt-csurf to protect this in nuxt.config.ts
export function proxyHandler (
  event: H3Event,
  proxyBase: string,
  graphqlApikey: string
) {
  // Check user provided apikey
  const query = getQuery(event)
  const requestApikey = (query.apikey ? query.apikey.toString() : '') || event.headers.get('apikey') || ''

  // Check user provided bearer
  const requestBearer = event.headers.get('authorization') || ''
  console.log('requestBearer?', requestBearer)
  // Auth headers
  const headers = {
    authorization: requestBearer,
    apikey: requestApikey || graphqlApikey
  }
  console.log('outgoing request headers:', headers)
  // Proxy request
  const proxyBaseUrl = new URL(proxyBase)
  const proxyBasePathname = proxyBaseUrl.pathname === '/' ? '' : proxyBaseUrl.pathname
  const newPath = proxyBasePathname + event.path.replace('/api/v2', '')
  const target = new URL(
    newPath,
    proxyBaseUrl.toString()
  )
  console.log('proxyHandler: target URL:', target.toString())
  console.log('proxyHandler: event.path:', event.path)
  console.log('proxyHandler: newPath:', newPath)
  console.log('proxyHandler: headers being sent:', sanitizeStringify(headers))

  // console.log('proxyHandler', target.toString(), 'headers:', headers)
  return proxyRequest(event, target.toString(), {
    fetchOptions: {
      redirect: 'manual'
    },
    headers
  })
}
