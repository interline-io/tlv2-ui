import { proxyRequest, getQuery, H3Event, defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'
import { safeStringify } from '../utils/log-sanitizer'

// Use sessions and/or nuxt-csurf to protect this in nuxt.config.ts
export function proxyHandler (
  event: H3Event,
  proxyBase: string,
  graphqlApikey: string
) {
  console.log('proxyHandler: event type:', typeof event)
  console.log('proxyHandler: event headers:', safeStringify(event.headers))
  console.log('proxyHandler: event headers type:', typeof event.headers)
  console.log('proxyHandler: event headers methods:', event.headers ? Object.getOwnPropertyNames(event.headers) : 'N/A')

  // Check user provided apikey
  const query = getQuery(event)
  const requestApikey = (query.apikey ? query.apikey.toString() : '') || event.headers.get('apikey') || ''

  // Check user provided bearer
  const requestBearer = event.headers.get('authorization') || ''

  // Auth headers
  const headers = {
    authorization: requestBearer,
    apikey: requestApikey || graphqlApikey
  }

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
  console.log('proxyHandler: headers being sent:', safeStringify(headers))

  // console.log('proxyHandler', target.toString(), 'headers:', headers)
  return proxyRequest(event, target.toString(), {
    fetchOptions: {
      redirect: 'manual'
    },
    headers
  })
}

export default defineEventHandler((event) => {
  // Pass event; see https://github.com/nuxt/nuxt/issues/25047
  const config = useRuntimeConfig(event)
  return proxyHandler(
    event,
    String(config.proxyBase),
    String(config.graphqlApikey)
  )
})
