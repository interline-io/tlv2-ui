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
      useProxy: boolean
      safelinkUtmSource?: string
      apiBase: {
        default?: string
        stationEditor: string
        feedManagement: string
      }
      protomapsApikey?: string
      nearmapsApikey?: string
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

export {}
