import './components.d.ts'
import type { Tlv2RouteKey } from './route-keys'

declare module 'nuxt/schema' {
  interface RuntimeConfig {
    tlv2: {
      graphqlApikey: string
      proxyBase: {
        default?: string
        stationEditor: string
        feedManagement: string
      }
    }
  }

  interface PublicRuntimeConfig {
    tlv2: {
      safelinkUtmSource?: string
      apiBase: {
        default?: string
        stationEditor: string
        feedManagement: string
      }
      routes?: Partial<Record<Tlv2RouteKey, string>>
      protomapsApikey?: string
      nearmapsApikey?: string
      mixpanelApikey?: string
      loginGate?: boolean
      requireLogin?: boolean
      editorRoutePrefix: string
      transferAnalystReadOnlyFeedSelector?: boolean
      transferAnalystGtfsRealtimeStopObservations?: boolean
    }
  }
}

// Add type declarations for Vue Apollo
declare module 'vue' {
  interface ComponentCustomProperties {
    $apollo: any
    $buefy: any
  }
}

export {}
