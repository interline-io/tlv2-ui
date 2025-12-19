import { useRuntimeConfig } from '#imports'
import { defineEventHandler } from 'h3'
import { proxyHandler } from '../lib/util/proxy'

export default defineEventHandler((event) => {
  // Pass event; see https://github.com/nuxt/nuxt/issues/25047
  const config = useRuntimeConfig(event)
  return proxyHandler(
    event,
    String(config.tlv2.proxyBase?.default),
    String(config.tlv2.graphqlApikey)
  )
})
