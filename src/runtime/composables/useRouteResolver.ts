import { useRuntimeConfig } from '#imports'
import { TLV2_ROUTE_KEYS } from '../route-keys'

export function useRouteResolver () {
  const config = useRuntimeConfig()
  const tlv2 = config.public.tlv2 || {}

  // Default route mapping
  const defaultRoutes = Object.fromEntries(TLV2_ROUTE_KEYS.map(key => [key, key]))

  function resolve (key: string): string {
    // 1. Check for explicit mapping in config
    const routes = tlv2.routes as Record<string, string> | undefined
    if (routes?.[key]) {
      return routes[key]
    }

    // 2. Fallback to default (empty string)
    if (key in defaultRoutes) {
      return defaultRoutes[key] || ''
    }

    // 3. Unknown key
    console.warn(`[tlv2-ui] Unknown route key: ${key}`)
    return ''
  }

  return { resolve }
}
