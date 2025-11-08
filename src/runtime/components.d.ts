// Component type declarations for TypeScript
// This ensures all tl-* and o-* components are type-checked
//
// Note: Oruga UI doesn't provide proper TypeScript definitions,
// so we use 'any' as a pragmatic compromise. At least unknown
// components will be caught - better than nothing!

import type { DefineComponent } from 'vue'

declare module 'vue' {
  export interface GlobalComponents {
    // Oruga UI components (o-* prefix)
    // Using 'any' because @oruga-ui doesn't export proper types
    OButton: any
    OField: any
    OInput: any
    OSelect: any
    OCheckbox: any
    ODropdown: any
    ODropdownItem: any
    OIcon: any
    OTooltip: any
    ONotification: any
    OLoading: any
    OTabs: any
    OTabItem: any
    OSlider: any
    OSliderTick: any
    ODatepicker: any
    OTimepicker: any
    OSwitch: any
    ORadio: any
    OTable: any
    OTableColumn: any
    OModal: any
    OCollapse: any
    OCollapseItem: any
    OSidebar: any
    OPagination: any
    OAutocomplete: any
    OUpload: any
    OSkeleton: any

    // Nuxt Link
    NuxtLink: DefineComponent<{
      to?: string | object
      href?: string
      replace?: boolean
      activeClass?: string
      exactActiveClass?: string
      [key: string]: any
    }>
    // Pages
    TlStopPage: typeof import('./components/pages/stop.vue')['default']
    TlFeedsPage: typeof import('./components/pages/feeds.vue')['default']

    // Base components
    TlLoading: typeof import('./components/loading.vue')['default']
    TlTitle: typeof import('./components/title.vue')['default']
    TlProps: typeof import('./components/props.vue')['default']
    TlSafelink: typeof import('./components/safelink.vue')['default']
    TlRouteIcon: typeof import('./components/route-icon.vue')['default']
    TlLoginGate: typeof import('./components/login-gate.vue')['default']
    TlTag: typeof import('./components/tag.vue')['default']
    TlShowMore: typeof import('./components/show-more.vue')['default']
    TlLoadable: typeof import('./components/loadable.vue')['default']
    TlModal: typeof import('./components/modal.client.vue')['default']
    TlDarkMode: typeof import('./components/dark-mode.vue')['default']
    TlNavSearchBar: typeof import('./components/nav-search-bar.vue')['default']
    TlSearchBar: typeof import('./components/search-bar.vue')['default']
    TlUserIcon: typeof import('./components/user-icon.vue')['default']
    TlBreadcrumbs: typeof import('./components/breadcrumbs.vue')['default']

    // Message components
    TlMsgError: typeof import('./components/msg/error.vue')['default']
    TlMsgWarning: typeof import('./components/msg/warning.vue')['default']
    TlMsgInfo: typeof import('./components/msg/info.vue')['default']
    TlMsgSuccess: typeof import('./components/msg/success.vue')['default']

    // Check components
    TlCheckFresh: typeof import('./components/check-fresh.vue')['default']
    TlCheckSingle: typeof import('./components/check-single.vue')['default']

    // Table components
    TlAgencyTable: typeof import('./components/agency-table.vue')['default']
    TlFeedsTable: typeof import('./components/feeds-table.vue')['default']
    TlFeedVersionTable: typeof import('./components/feed-version-table.vue')['default']
    TlOperatorsTable: typeof import('./components/operators-table.vue')['default']
    TlRouteTable: typeof import('./components/route-table.vue')['default']
    TlStopTable: typeof import('./components/stop-table.vue')['default']
    TlFileInfoTable: typeof import('./components/file-info-table.vue')['default']

    // Map and viewer components
    TlMapViewer: typeof import('./components/map-viewer.client.vue')['default']
    TlFeedVersionMapViewer: typeof import('./components/feed-version-map-viewer.client.vue')['default']
    TlMapRouteList: typeof import('./components/map-route-list.vue')['default']
    TlMapSearch: typeof import('./components/map-search.vue')['default']
    TlBufferViewer: typeof import('./components/buffer-viewer.vue')['default']
    TlCensusViewer: typeof import('./components/census-viewer.vue')['default']
    TlHeadwayViewer: typeof import('./components/headway-viewer.vue')['default']
    TlRspViewer: typeof import('./components/rsp-viewer.vue')['default']

    // Feed components
    TlFeedInfo: typeof import('./components/feed-info.vue')['default']
    TlFeedVersionActive: typeof import('./components/feed-version-active-status.vue')['default']
    TlFeedVersionActiveStatus: typeof import('./components/feed-version-active-status.vue')['default']
    TlFeedVersionDownload: typeof import('./components/feed-version-download.vue')['default']
    TlFeedVersionEdit: typeof import('./components/feed-version-edit.vue')['default']
    TlFeedVersionImport: typeof import('./components/feed-version-import.vue')['default']
    TlFeedVersionImportStatus: typeof import('./components/feed-version-import-status.vue')['default']
    TlFeedVersionTimelineChartPlot: typeof import('./components/feed-version-timeline-chart-plot.client.vue')['default']
    TlFeedRtApiQuery: typeof import('./components/feed-rt-api-query.vue')['default']
    TlFeedRtDownload: typeof import('./components/feed-rt-download.vue')['default']

    // Stop and route components
    TlStopDepartures: typeof import('./components/stop-departures.vue')['default']
    TlStopDepartureSettings: typeof import('./components/stop-departure-settings.vue')['default']
    TlDirections: typeof import('./components/directions.vue')['default']
    TlDirectionsStops: typeof import('./components/directions-stops.vue')['default']
    TlRouteSelect: typeof import('./components/route-select.vue')['default']
    TlRouteTypeSelect: typeof import('./components/route-type-select.vue')['default']

    // Other components
    TlAssociatedOperators: typeof import('./components/associated-operators.vue')['default']
    TlApiExample: typeof import('./components/api-example.client.vue')['default']
    TlDataExport: typeof import('./components/data-export.vue')['default']
    TlGeojsonDownloader: typeof import('./components/geojson-downloader.vue')['default']
    TlGtfsExportDownload: typeof import('./components/gtfs-export-download.vue')['default']
    TlGeolocation: typeof import('./components/geolocation.vue')['default']
    TlMultiServiceLevels: typeof import('./components/multi-service-levels.vue')['default']
    TlPlaces: typeof import('./components/places.vue')['default']
  }
}

export {}
