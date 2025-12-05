<template>
  <div class="station-select-map-wrapper">
    <div ref="mapContainer" class="station-select-map" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { Map as MapLibreMap, NavigationControl, Popup, LngLatBounds } from 'maplibre-gl'
import type { LngLatLike, MapMouseEvent, GeoJSONSource } from 'maplibre-gl'
import { useBasemapLayers } from '../../../composables/useBasemapLayers'
import type { StationHub } from './types'
import { haversinePosition } from '../../../geom'

const PIXEL_RADIUS = 10

/**
 * Find the nearest feature to the mouse coordinates from a list of features
 * Uses haversine distance to find the closest feature by geographic distance
 * @param features - Array of GeoJSON features with Polygon or MultiPolygon geometries
 * @param mouseCoord - Mouse coordinates as [longitude, latitude]
 * @returns The closest feature or null if no features provided
 */
function findNearestFeature (features: any[], mouseCoord: [number, number]): any | null {
  if (features.length === 0) return null

  let closestFeature = features[0]!
  let minDistance = Infinity

  for (const feature of features) {
    if (feature.geometry?.type === 'Polygon' || feature.geometry?.type === 'MultiPolygon') {
      // Get first coordinate as a simple distance approximation
      const coords = feature.geometry.type === 'Polygon'
        ? feature.geometry.coordinates[0]?.[0]
        : feature.geometry.coordinates[0]?.[0]?.[0]
      if (coords) {
        const distance = haversinePosition(mouseCoord, coords)
        if (distance < minDistance) {
          minDistance = distance
          closestFeature = feature
        }
      }
    }
  }
  return closestFeature
}

interface Props {
  stationHubs?: StationHub[]
  /** Initial map center as [longitude, latitude]. Defaults to Oakland, CA. */
  center?: [number, number]
  /** Initial zoom level. Defaults to 12. */
  zoom?: number
}

const props = withDefaults(defineProps<Props>(), {
  stationHubs: () => [],
  center: () => [-122.28, 37.78],
  zoom: 12
})

const emit = defineEmits<{
  stationClick: [stationKey: string]
}>()

const mapContainer = ref<HTMLElement>()
const map = ref<MapLibreMap | null>(null)

function initMap (): void {
  if (!mapContainer.value) return

  const { basemapLayers } = useBasemapLayers()
  const basemaps = basemapLayers.value

  const mapValue = new MapLibreMap({
    container: mapContainer.value,
    center: props.center as LngLatLike,
    zoom: props.zoom,
    style: {
      version: 8,
      sources: {
        'carto': {
          type: 'raster',
          tiles: basemaps.carto.source.tiles,
        },
        'station-hubs': {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: props.stationHubs
          },
          tolerance: 0
        }
      },
      layers: [
        {
          id: 'carto',
          source: 'carto',
          type: 'raster',
          ...basemaps.carto.layer
        },
        {
          id: 'station-hubs-fill',
          type: 'fill',
          source: 'station-hubs',
          paint: {
            'fill-color': '#3bb2d0',
            'fill-opacity': 0.3
          }
        },
        {
          id: 'station-hubs-outline',
          type: 'line',
          source: 'station-hubs',
          paint: {
            'line-color': '#3bb2d0',
            'line-width': 8
          }
        }
      ]
    }
  })

  mapValue.addControl(new NavigationControl(), 'top-right')

  mapValue.on('load', () => {
    mapValue!.resize()

    if (props.stationHubs.length > 0) {
      // Fit bounds to station hubs - use nextTick to ensure DOM is ready
      nextTick(() => {
        const bounds = props.stationHubs.reduce((bounds: LngLatBounds, feature) => {
          if (feature.geometry.type === 'Polygon') {
            feature.geometry.coordinates[0]?.forEach((coord: number[]) => {
              bounds.extend(coord as [number, number])
            })
          } else if (feature.geometry.type === 'MultiPolygon') {
            feature.geometry.coordinates.forEach((polygon: number[][][]) => {
              polygon[0]?.forEach((coord: number[]) => {
                bounds.extend(coord as [number, number])
              })
            })
          }
          return bounds
        }, new LngLatBounds())

        mapValue!.fitBounds(bounds, { padding: 20 })
      })
    }
  })

  // Handle station interactions
  const popup = new Popup({
    closeButton: false,
    closeOnClick: false
  })

  // Use general mousemove to query features with larger radius
  mapValue.on('mousemove', (e: MapMouseEvent) => {
    const bbox: [[number, number], [number, number]] = [
      [e.point.x - PIXEL_RADIUS, e.point.y - PIXEL_RADIUS],
      [e.point.x + PIXEL_RADIUS, e.point.y + PIXEL_RADIUS]
    ]
    const features = map.value!.queryRenderedFeatures(bbox, { layers: ['station-hubs-fill'] })

    if (features.length > 0) {
      const closestFeature = findNearestFeature(features, [e.lngLat.lng, e.lngLat.lat])
      const name = closestFeature?.properties?.name || 'Unknown'
      mapValue!.getCanvas().style.cursor = 'pointer'
      popup.setLngLat(e.lngLat).setHTML(`<strong>${name}</strong>`).addTo(mapValue)
    } else {
      mapValue!.getCanvas().style.cursor = ''
      popup.remove()
    }
  })

  // Emit station click event
  mapValue.on('click', (e: MapMouseEvent) => {
    const bbox: [[number, number], [number, number]] = [
      [e.point.x - PIXEL_RADIUS, e.point.y - PIXEL_RADIUS],
      [e.point.x + PIXEL_RADIUS, e.point.y + PIXEL_RADIUS]
    ]
    const features = mapValue!.queryRenderedFeatures(bbox, { layers: ['station-hubs-fill'] })
    if (features.length > 0) {
      const closestFeature = findNearestFeature(features, [e.lngLat.lng, e.lngLat.lat])
      const stationKey = closestFeature?.properties?.id
      if (stationKey) {
        emit('stationClick', stationKey)
      }
    }
  })

  map.value = mapValue as any
}

// Watch for station hubs changes
watch(() => props.stationHubs, () => {
  if (map.value) {
    const source = map.value.getSource('station-hubs') as GeoJSONSource
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: props.stationHubs
      })
    }
  }
}, { deep: true })

onMounted(() => {
  initMap()
})

onBeforeUnmount(() => {
  map.value?.remove()
  map.value = null
})
</script>

<style scoped>
.station-select-map-wrapper {
  position: relative;
  height: 400px;
  width: 100%;
}

.station-select-map {
  height: 100%;
  width: 100%;
}
</style>

<style>
@import 'maplibre-gl/dist/maplibre-gl.css';
</style>
