import { proxyRequest, getQuery, H3Event } from 'h3'

export function proxyHandler(
  event: H3Event,
  proxyBase: string,
  allowedReferer: string,
  graphqlApikey: string
) {
  // Check user provided apikey
  const query = getQuery(event)
  let apikey = (query.apikey ? query.apikey.toString() : '') || event.headers.get('apikey') || ''

  // Check user provided bearer
  const bearer = event.headers.get('authorization') || ''

  // Check if allowed
  let allowed = false
  if (apikey || bearer) {
    allowed = true
  } else {
    // Check referer
    const referer = event.headers.get('referer')
    const allowedReferers = [allowedReferer, 'http://localhost:3000']
    for (const ref of allowedReferers) {
      if (referer?.startsWith(ref)) {
        allowed = true
      }
    }
    apikey = graphqlApikey
  }
  if (!allowed) {
    return { error: `use ${proxyBase}` }
  }

  // Auth headers
  const headers = {
    authorization: bearer,
    apikey
  }

  // Proxy request
  const proxyBaseUrl = new URL(proxyBase)
  const newPath = proxyBaseUrl.pathname + event.path.replace('/api/v2', '')
  const target = new URL(
    newPath,
    proxyBase
  )
  console.log(
    'newPath:', newPath,
    'proxyBase:', proxyBase,
    'event.path:', event.path,
    'proxyBase pathname:', proxyBaseUrl.pathname,
    'target:', target.toString(),
    'headers:', headers
  )
  return proxyRequest(event, target.toString(), { headers })
}
