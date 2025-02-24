declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $filters: {
      makeRouteLink: (
        onestop_id: string | null,
        feed_onestop_id: string | null,
        feed_version_sha1: string | null,
        route_id: string | null,
        id: number | null,
        linkVersion: boolean
      ) => string;
      makeStopLink: (
        onestop_id: string | null,
        feed_onestop_id: string | null,
        feed_version_sha1: string | null,
        stop_id: string | null,
        id: number | null,
        linkVersion: boolean
      ) => string;
    }
  }
} 