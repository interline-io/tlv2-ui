import { defineEventHandler, createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import { proxyHandler } from '../lib/util/proxy'
import { parseProxyRoute, resolveProxyBase } from '../lib/util/proxy-route'
import { useAuth0Session } from '../server/useSession'

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

  const auth = await useAuth0Session(event)

  return proxyHandler(
    event,
    proxyBase,
    String(config.tlv2.graphqlApikey),
    auth.accessToken,
    strippedPath
  )
})
