<template>
  <div class="tl-fv-map">
    <tl-loading v-if="loading" />
    <tl-msg-error v-else-if="error">
      {{ error }}
    </tl-msg-error>
    <div v-else>
      <tl-map-viewer
        :enable-scroll-zoom="enableScrollZoom"
        :features="features"
        :route-features="routeFeatures"
        :stop-features="stopFeatures"
        :center="center"
        :auto-fit="autoFit"
        :zoom="zoom"
        :circle-radius="circleRadius"
        :circle-color="circleColor"
        @set-agency-features="agencyFeatures = $event"
        @map-click="mapClick"
        @set-zoom="currentZoom = $event"
      />
      <div v-if="overlay" class="tl-fv-map-panel">
        <tl-map-route-list
          :link-version="linkVersion"
          :agency-features="agencyFeatures"
          :is-component-modal-active="isComponentModalActive"
          @close="isComponentModalActive = false"
        >
          <strong>Select routes</strong>
          <br>
          Use your cursor to highlight routes
        </tl-map-route-list>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, computed, watch } from 'vue'
import { gql } from 'graphql-tag'
import { useQuery } from '@vue/apollo-composable'
import type { Geometry, Point } from 'geojson'
import type { LonLat } from '../geom'

// Types
interface RouteResponse {
  id: number
  onestop_id: string
  feed_onestop_id: string
  feed_version_sha1: string
  route_id: string
  route_color: string
  route_desc?: string
  route_long_name?: string
  route_short_name?: string
  route_type: number
  route_url?: string
  geometries: {
    geometry: Geometry
    combined_geometry: Geometry
    generated: boolean
    length?: number
    max_segment_length?: number
  }[]
  headways?: {
    dow_category: number
    direction_id: number
    headway_secs: number
  }[]
  route_stops?: {
    stop: {
      id: number
      stop_id: string
      stop_name: string
      geometry: Point
      location_type?: number
    }
  }[]
  agency?: {
    id: number
    agency_id: string
    agency_name: string
  }
  __typename?: string
}

// Extract individual types from the response type
type Route = RouteResponse

interface MapFeature {
  id: number
  type: 'Feature'
  properties: any
  geometry: Geometry
}

// Props
const props = withDefaults(defineProps<{
  autoFit?: boolean
  limit?: number
  maxLimit?: number
  feedVersionSha1?: string | null
  includeStops?: boolean
  overlay?: boolean
  fvids?: number[] | null
  routeIds?: number[] | null
  agencyIds?: number[] | null
  linkVersion?: boolean
  features?: any[]
  center?: LonLat
  zoom?: number | null
  enableScrollZoom?: boolean
  circleRadius?: number
  circleColor?: string
}>(), {
  autoFit: true,
  limit: 1000,
  maxLimit: 10000,
  feedVersionSha1: null,
  includeStops: false,
  overlay: false,
  fvids: null,
  routeIds: null,
  agencyIds: null,
  linkVersion: false,
  features: () => [],
  center: undefined,
  zoom: null,
  enableScrollZoom: false,
  circleRadius: 1,
  circleColor: '#f03b20'
})

const emit = defineEmits<{
  setRouteFeatures: [features: MapFeature[]]
  setSopFeatures: [features: MapFeature[]]
}>()

const q = gql`
query ($limit: Int=100, $agency_ids: [Int!], $after:Int!=0, $route_ids: [Int!], $feed_version_sha1: String, $include_stops: Boolean! = false) {
  routes(after:$after, limit: $limit, ids: $route_ids, where: {agency_ids: $agency_ids, feed_version_sha1: $feed_version_sha1}) {
    id
    onestop_id
    feed_onestop_id
    feed_version_sha1
    route_id
    route_color
    route_desc
    route_long_name
    route_short_name
    route_type
    route_url
    geometries {
      geometry
      combined_geometry
      generated
      length
      max_segment_length
    }
    headways {
      dow_category
      direction_id
      headway_secs
    }
    route_stops(limit: 1000) @include(if: $include_stops) {
      stop {
        id
        stop_id
        stop_name
        geometry
      }
    }
    agency {
      id
      agency_id
      agency_name
    }
  }
}
`

// Reactive data
const loading = ref(true)
const routes = ref<Route[]>([])
const error = ref<string | null>(null)
const isComponentModalActive = ref(false)
const agencyFeatures = ref<Record<string, any>>({})
const currentZoom = ref(props.zoom)

// Apollo query
const { result, fetchMore: apolloFetchMore, onError } = useQuery<{ routes: RouteResponse[] }>(
  q,
  () => ({
    include_stops: props.includeStops,
    feed_version_sha1: props.feedVersionSha1,
    route_ids: props.routeIds,
    agency_ids: props.agencyIds,
    limit: props.limit,
    after: 0
  }),
  {
    errorPolicy: 'all'
  }
)

// Handle Apollo errors
onError((e) => {
  error.value = e.message
})

// Watch for Apollo query results
watch(result, (data) => {
  if (data?.routes) {
    routes.value = data.routes
    nextTick(() => {
      fetchMore()
    })
  }
}, { immediate: true })

// Computed properties
const routeFeatures = computed<MapFeature[]>(() => {
  const features: MapFeature[] = []
  for (const feature of routes.value) {
    if (!feature.geometries || feature.geometries.length === 0) {
      continue
    }
    const geom = feature.geometries[0]
    if (!geom) {
      continue
    }
    let routeColor = feature.route_color
    if (routeColor && routeColor.length > 2 && routeColor.substr(0, 1) !== '#') {
      routeColor = '#' + routeColor
    }
    const headwaySorted = (feature.headways || [])
      .filter(s => s.dow_category === 1)
      .sort((a, b) => a.direction_id < b.direction_id ? -1 : 1)
    const firstHeadway = headwaySorted.length > 0 ? headwaySorted[0] : undefined
    const fcopy = Object.assign({}, feature, {
      geometry_length: geom.length || -1,
      generated: geom.generated,
      max_segment_length: geom.max_segment_length,
      route_color: routeColor,
      headway_secs: (firstHeadway?.headway_secs ?? null) || -1,
      agency_name: feature.agency ? feature.agency.agency_name : null
    }) as any
    delete fcopy.geometry
    delete fcopy.__typename
    features.push({
      id: feature.id,
      type: 'Feature',
      properties: fcopy,
      geometry: geom.combined_geometry
    })
  }
  return features
})

const stopFeatures = computed<MapFeature[]>(() => {
  const features: MapFeature[] = []
  for (const feature of routes.value) {
    for (const g of feature.route_stops || []) {
      if (g.stop.location_type === 0 || g.stop.location_type === 2) {
        continue
      }
      const fcopy = Object.assign({}, g.stop) as any
      delete fcopy.geometry
      delete fcopy.__typename
      features.push({
        type: 'Feature',
        geometry: g.stop.geometry,
        properties: fcopy,
        id: g.stop.id
      })
    }
  }
  return features
})

// Watchers
watch(routeFeatures, (v) => {
  emit('setRouteFeatures', v)
})

watch(stopFeatures, (v) => {
  emit('setSopFeatures', v)
})

// Methods
const fetchMore = () => {
  if (routes.value.length > props.maxLimit) {
    loading.value = false
    return
  }
  if (!loading.value) {
    return
  }
  const lastRoute = routes.value.length > 0 ? routes.value[routes.value.length - 1] : undefined
  const lastId = lastRoute?.id ?? 0
  apolloFetchMore({
    variables: {
      after: lastId,
      limit: props.limit
    },
    updateQuery: (previousResult, { fetchMoreResult }) => {
      const cur = [...previousResult.routes, ...fetchMoreResult.routes]
      if (fetchMoreResult.routes.length < props.limit) {
        loading.value = false
      }
      return {
        routes: cur
      }
    }
  })
}

const mapClick = () => {
  if (Object.keys(agencyFeatures.value).length > 0) {
    isComponentModalActive.value = true
  }
}
</script>

<style scoped>
.tl-fv-map {
  position:relative
}
.tl-fv-map-panel {
    background-color: var(--bulma-scheme-main);
    user-select: none;
    position: absolute !important;
    margin: 0px;
    padding: 10px;
    top: 10px;
    left: 10px;
    width: 350px;
    max-width: 565px;
}
</style>
