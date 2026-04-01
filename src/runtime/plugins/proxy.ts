import { defineEventHandler, createError } from 'h3'
// @ts-expect-error useAuth0 is added to #imports by @auth0/auth0-nuxt via addServerImportsDir
import { useRuntimeConfig, useAuth0 } from '#imports'
import { proxyHandler } from '../lib/util/proxy'
import { parseProxyRoute, resolveProxyBase } from '../lib/util/proxy-route'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  const parsed = parseProxyRoute(event.path || '')
  if (!parsed) {
    throw createError({
      statusCode: 400,
      message: '[tlv2-proxy] Invalid proxy path'
    })
  }
  const { backendName, strippedPath } = parsed

  const proxyBases: Record<string, string> = config.tlv2?.proxyBase || {}
  const proxyBase = resolveProxyBase(backendName, proxyBases)
  if (!proxyBase) {
    throw createError({
      statusCode: 404,
      message: `[tlv2-proxy] Unknown backend: ${backendName}`
    })
  }

  const auth0 = useAuth0(event)
  const session = await auth0.getSession()
  let accessToken = ''
  if (session) {
    const tokenSet = await auth0.getAccessToken()
    accessToken = tokenSet.accessToken
  }

  return proxyHandler(
    event,
    proxyBase,
    String(config.tlv2.graphqlApikey),
    accessToken,
    strippedPath
  )
})
