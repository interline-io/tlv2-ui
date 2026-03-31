import { defineEventHandler } from 'h3'
import { proxyHandler } from '../lib/util/proxy'

export default defineEventHandler(async (event) => {
  // Dynamic import of #imports to access Nitro auto-imports (including useAuth0)
  // at runtime rather than at module parse time. This ensures the auto-imports
  // are available even when the file is registered via addServerHandler from a module.
  const { useRuntimeConfig, useAuth0 } = await import('#imports') as any
  const config = useRuntimeConfig(event)

  let accessToken = ''
  try {
    const auth0 = useAuth0(event)
    const tokenSet = await auth0.getAccessToken()
    accessToken = tokenSet.accessToken
  } catch (e) {
    console.warn('[tlv2-proxy] getAccessToken failed:', e)
  }

  return proxyHandler(
    event,
    String(config.tlv2.proxyBase?.default),
    String(config.tlv2.graphqlApikey),
    accessToken
  )
})
