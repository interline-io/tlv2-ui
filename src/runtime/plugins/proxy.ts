import { proxyRequest, getQuery, H3Event, defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

// Use sessions and/or nuxt-csurf to protect this in nuxt.config.ts
export function proxyHandler(
  event: H3Event,
  proxyBase: string,
  graphqlApikey: string
) {
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
  return proxyRequest(event, target.toString(), { headers })
}

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  return proxyHandler(
    event,
    String(config.proxyBase),
    String(config.graphqlApikey)
  )
})
