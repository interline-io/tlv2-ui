import { useRuntimeConfig } from '#imports'
import { defineEventHandler } from 'h3'
import { proxyHandler } from '../lib/util/proxy'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  // Extract JWT from auth0-nuxt session
  let accessToken = ''
  try {
    // useAuth0 is auto-imported by Nitro from @auth0/auth0-nuxt
    // @ts-expect-error — type available at runtime via Nitro auto-imports
    const auth0 = useAuth0(event)
    const tokenSet = await auth0.getAccessToken()
    accessToken = tokenSet.accessToken
  } catch {
    // No valid session — proxy without auth token
  }

  return proxyHandler(
    event,
    String(config.tlv2.proxyBase?.default),
    String(config.tlv2.graphqlApikey),
    accessToken
  )
})
