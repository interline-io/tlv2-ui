import './components.d.ts'
import type { Tlv2RouteKey } from './route-keys'
import type { AuthMode } from '../module'

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
      authMode: AuthMode
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
      // SPA-mode Auth0 config (only present when authMode === 'spa')
      auth0Domain?: string
      auth0ClientId?: string
      auth0RedirectUri?: string
      auth0LogoutUri?: string
      auth0Audience?: string
      auth0Scope?: string
      transferAnalystReadOnlyFeedSelector?: boolean
      transferAnalystGtfsRealtimeStopObservations?: boolean
    }
  }
}

// Add type declarations for nuxt-csurf composables (SPA mode)
declare module '#imports' {
  export function useCsrf (): {
    csrf: string
    headerName: string
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
