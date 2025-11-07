<template>
  <div />
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useQuery } from '@vue/apollo-composable'
import { gql } from 'graphql-tag'

import type { Geometry, Feature } from 'geojson'

// Types
interface RouteResponse {
  id: number
  route_stop_buffer?: {
    stop_points: Geometry
    stop_buffer: Geometry
    stop_convexhull: Geometry
  } | null
}

type Route = RouteResponse

// GraphQL Query
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

// Props
const props = withDefaults(defineProps<{
  radius?: number
  stopIds?: number[] | null
  routeIds?: number[] | null
  agencyIds?: number[] | null
}>(), {
  radius: 400,
  stopIds: null,
  routeIds: null,
  agencyIds: null
})

// Emits
const emit = defineEmits<{
  setBufferFeatures: [features: Feature[]]
  setHullFeatures: [features: Feature[]]
}>()

// Apollo query
const { result, loading } = useQuery<{ routes: RouteResponse[] }>(
  routesQuery,
  () => ({
    radius: props.radius,
    route_ids: props.routeIds
  }),
  {}
)

// Computed properties
const routes = computed((): Route[] => {
  return result.value?.routes || []
})

const bufferFeatures = computed((): Feature[] => {
  if (loading.value) { return [] }

  const features: Feature[] = []
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

const hullFeatures = computed((): Feature[] => {
  if (loading.value) { return [] }

  const features: Feature[] = []
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
