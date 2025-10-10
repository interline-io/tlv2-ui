<template>
  <div />
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { gql } from 'graphql-tag'

// TypeScript interfaces
interface GeoJSONGeometry {
  type: string
  coordinates: any[]
}

interface GeoJSONFeature {
  type: 'Feature'
  geometry: GeoJSONGeometry
  properties: Record<string, any>
}

interface RouteStopBuffer {
  stop_points: GeoJSONGeometry
  stop_buffer: GeoJSONGeometry
  stop_convexhull: GeoJSONGeometry
}

interface Route {
  id: number
  route_stop_buffer?: RouteStopBuffer | null
}

interface RoutesQueryResponse {
  routes: Route[]
}

// Props
interface Props {
  radius?: number
  stopIds?: number[] | null
  routeIds?: number[] | null
  agencyIds?: number[] | null
}

const props = withDefaults(defineProps<Props>(), {
  radius: 400,
  stopIds: null,
  routeIds: null,
  agencyIds: null
})

// Emits
const emit = defineEmits<{
  setBufferFeatures: [features: GeoJSONFeature[]]
  setHullFeatures: [features: GeoJSONFeature[]]
}>()

// GraphQL query
const routesQuery = gql`
  query ($route_ids: [Int!], $radius: Float!) {
    routes: routes(ids: $route_ids) {
      id
      route_stop_buffer(radius: $radius) {
        stop_points
        stop_buffer
        stop_convexhull
      }
    }
  }
`

// Apollo query
const { result, loading } = useQuery<RoutesQueryResponse>(
  routesQuery,
  () => ({
    radius: props.radius,
    route_ids: props.routeIds
  }),
  {
    clientId: 'transitland'
  }
)

// Computed properties
const routes = computed((): Route[] => {
  return result.value?.routes || []
})

const bufferFeatures = computed((): GeoJSONFeature[] => {
  if (loading.value) { return [] }

  const features: GeoJSONFeature[] = []
  for (const route of routes.value) {
    if (!route.route_stop_buffer) {
      continue
    }
    features.push({
      type: 'Feature',
      geometry: route.route_stop_buffer.stop_buffer,
      properties: { radius: props.radius }
    })
  }
  return features
})

const hullFeatures = computed((): GeoJSONFeature[] => {
  if (loading.value) { return [] }

  const features: GeoJSONFeature[] = []
  for (const route of routes.value) {
    if (!route.route_stop_buffer) {
      continue
    }
    features.push({
      type: 'Feature',
      geometry: route.route_stop_buffer.stop_convexhull,
      properties: {}
    })
  }
  return features
})

// Watchers
watch(bufferFeatures, (newFeatures) => {
  emit('setBufferFeatures', newFeatures)
})

watch(hullFeatures, (newFeatures) => {
  emit('setHullFeatures', newFeatures)
})
</script>
