import { useRuntimeConfig } from '#imports'
import { defineEventHandler } from 'h3'
import { proxyHandler } from '../lib/util/proxy'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const authMode = config.public?.tlv2?.authMode || 'server'

  let accessToken = ''

  if (authMode === 'server') {
    // Server mode: extract JWT from auth0-nuxt encrypted session cookie
    try {
      // useAuth0 is auto-imported by Nitro from @auth0/auth0-nuxt
      // @ts-expect-error — type available at runtime via Nitro auto-imports
      const auth0 = useAuth0(event)
      const tokenSet = await auth0.getAccessToken()
      accessToken = tokenSet.accessToken
    } catch {
      // No valid session — proxy without auth token
    }
  } else {
    // SPA mode: forward the Authorization header from the client request
    const authHeader = event.headers.get('authorization') || ''
    if (authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.slice(7)
    }
  }

  return proxyHandler(
    event,
    String(config.tlv2.proxyBase?.default),
    String(config.tlv2.graphqlApikey),
    accessToken
  )
})
