declare module 'nuxt/schema' {
  interface RuntimeConfig {
    tlv2: {
      graphqlApikey: string
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
      protomapsApikey?: string
      nearmapsApikey?: string
      mixpanelApikey?: string
      loginGate?: boolean
      requireLogin?: boolean
      editorRoutePrefix: string
      auth0Domain?: string
      auth0ClientId?: string
      auth0RedirectUri?: string
      auth0LogoutUri?: string
      auth0Audience?: string
      auth0Scope?: string
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

// Add type declaration for Oruga UI
declare module '@oruga-ui/oruga-next/dist/oruga.mjs' {
  const Oruga: any
  export default Oruga
}

// Add type declaration for Vue global properties
declare module 'vue' {
  interface ComponentCustomProperties {
    $oruga: {
      notification: {
        open: (options: any) => void
      }
    }
  }
}

export {}
