import { proxyRequest, getQuery, setResponseStatus, H3Event, defineEventHandler } from 'h3'
import { useRuntimeConfig } from '#imports'

export function proxyHandler(
  event: H3Event,
  proxyBase: string,
  allowedReferer: string,
  graphqlApikey: string
) {
  // Check user provided apikey
  const query = getQuery(event)
  const requestApikey = (query.apikey ? query.apikey.toString() : '') || event.headers.get('apikey') || ''

  // Check user provided bearer
  const requestBearer = event.headers.get('authorization') || ''

  // Check referer
  let allowed = false
  const referer = event.headers.get('referer')
  const allowedReferers = [allowedReferer, 'http://localhost:3000']
  for (const ref of allowedReferers) {
    if (referer?.startsWith(ref)) {
      allowed = true
    }
  }
  if (!allowed) {
    setResponseStatus(event, 404, 'Not Found')
    return { error: `use ${proxyBase}` }
  }

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
  // console.log(
  //   'newPath:', newPath,
  //   'proxyBase:', proxyBase,
  //   'event.path:', event.path,
  //   'proxyBase pathname:', proxyBaseUrl.pathname,
  //   'target:', target.toString(),
  //   'headers:', headers
  // )
  return proxyRequest(event, target.toString(), { headers })
}

export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  return proxyHandler(
    event,
    String(config.proxyBase),
    String(config.allowedReferer),
    String(config.graphqlApikey)
  )
})
