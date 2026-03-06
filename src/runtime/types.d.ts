import './components.d.ts'
import type { Tlv2RouteKey } from './route-keys'

declare module 'nuxt/schema' {
  interface RuntimeConfig {
    tlv2: {
      graphqlApikey: string
      auth0PublicKey: string
      auth0ClientSecret: string
      serverAuthRoutes: string[]
      proxyBase: {
        default?: string
        stationEditor: string
        feedManagement: string
      }
      apiBase: {
        default?: string
        stationEditor: string
        feedManagement: string
      }
    }
  }

  interface PublicRuntimeConfig {
    tlv2: {
      useProxy: boolean
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
      editorRoutePrefix: string
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

// Add type declarations for nuxt-csurf composables
declare module '#imports' {
  export function useCsrf (): {
    csrf: string
    headerName: string
  }
  export function useAuthHeaders (): Promise<Record<string, string>>
}

// Add type declarations for Vue Apollo
declare module 'vue' {
  interface ComponentCustomProperties {
    $apollo: any
    $buefy: any
  }
}

// Server-side auth context set by JWT middleware
declare module 'h3' {
  interface H3EventContext {
    auth?: {
      sub?: string
      email?: string
      permissions?: string[]
      payload: Record<string, unknown>
    }
  }
}

export {}
