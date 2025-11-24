<template>
  <div
    ref="mapContainer"
    class="platform-map"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount } from 'vue'
import { Map as MapLibreMap, Marker, NavigationControl, Popup, LngLatBounds } from 'maplibre-gl'
import type { LngLatLike } from 'maplibre-gl'
import { useBasemapLayers } from '~/composables/useBasemapLayers'
import type { StationHub } from './types'

interface Stop {
  id: string
  geometry: {
    coordinates: [number, number]
  }
  stop_name: string
  [key: string]: any
}

interface Props {
  stops: Stop[]
  stationArea: StationHub
  center?: [number, number]
  zoom?: number
}

const props = withDefaults(defineProps<Props>(), {
  center: () => [0, 0],
  zoom: 16
})

const mapContainer = ref<HTMLElement>()
const map = ref<MapLibreMap | null>(null)
const markers = new Map<string, Marker>()

onMounted(() => {
  initMap()
})

onBeforeUnmount(() => {
  // Clean up markers
  markers.forEach((marker: Marker) => marker.remove())
  markers.clear()

  // Remove map
  map.value?.remove()
  map.value = null
})

watch(() => props.stops, () => {
  updateMarkers()
}, { deep: true })

watch(() => props.stationArea, () => {
  updateAreaStation()
}, { deep: true })

function initMap () {
  if (!mapContainer.value) return

  const { basemapLayers } = useBasemapLayers()
  const basemaps = basemapLayers.value

  const mapValue = new MapLibreMap({
    container: mapContainer.value,
    center: props.center as LngLatLike,
    zoom: props.zoom,
    scrollZoom: false,
    style: {
      version: 8,
      sources: {
        'carto': basemaps.carto.source as any,
        'near': basemaps.near.source as any,
        'area-station': {
          type: 'geojson',
          data: props.stationArea as any
        }
      },
      layers: [
        {
          id: 'carto',
          source: 'carto',
          ...basemaps.carto.layer
        } as any,
        {
          id: 'near',
          source: 'near',
          ...basemaps.near.layer
        } as any,
        {
          id: 'area-station-fill',
          type: 'fill',
          source: 'area-station',
          paint: {
            'fill-color': '#3bb2d0',
            'fill-opacity': 0.1
          }
        },
        {
          id: 'area-station-outline',
          type: 'line',
          source: 'area-station',
          paint: {
            'line-color': '#3bb2d0',
            'line-width': 2
          }
        }
      ]
    }
  })

  // Add navigation controls
  mapValue.addControl(new NavigationControl(), 'top-right')

  mapValue.on('load', () => {
    updateMarkers()
    fitBounds()
  })

  map.value = mapValue as any
}

function updateAreaStation () {
  if (!map.value) return

  const source = map.value.getSource('area-station') as any
  if (source) {
    source.setData(props.stationArea as any)
    fitBounds()
  }
}

function updateMarkers () {
  if (!map.value) return

  // Remove markers that are no longer in the stops list
  const currentStopIds = new Set(props.stops.map(s => s.id))
  markers.forEach((marker: Marker, id: string) => {
    if (!currentStopIds.has(id)) {
      marker.remove()
      markers.delete(id)
    }
  })

  // Add or update markers
  props.stops.forEach((stop) => {
    const coords = stop.geometry.coordinates
    const lngLat: LngLatLike = [coords[0], coords[1]]

    let marker = markers.get(stop.id)

    if (!marker) {
      // Create custom marker element
      const el = document.createElement('div')
      el.className = 'platform-marker'
      el.innerHTML = getMarkerSVG()

      // Create popup
      const popup = new Popup({ offset: 25 }).setHTML(
        `<div class="platform-popup"><strong>${stop.stop_name}</strong></div>`
      )

      marker = new Marker({ element: el })
        .setLngLat(lngLat)
        .setPopup(popup)
        .addTo(map.value! as any)

      markers.set(stop.id, marker)
    } else {
      // Update existing marker position
      marker.setLngLat(lngLat)
    }
  })
}

function fitBounds () {
  if (!map.value || !props.stationArea?.geometry) return

  try {
    const features = map.value.querySourceFeatures('area-station')
    if (features.length > 0) {
      const bounds = features.reduce((bounds, feature) => {
        if (feature.geometry.type === 'Polygon') {
          feature.geometry.coordinates[0]?.forEach((coord: number[]) => {
            bounds.extend(coord as LngLatLike)
          })
        } else if (feature.geometry.type === 'MultiPolygon') {
          feature.geometry.coordinates.forEach((polygon: number[][][]) => {
            polygon[0]?.forEach((coord: number[]) => {
              bounds.extend(coord as LngLatLike)
            })
          })
        }
        return bounds
      }, new LngLatBounds())

      map.value.fitBounds(bounds, { padding: 40 })
    }
  } catch (e) {
    console.warn('Could not fit bounds:', e)
  }
}

function getMarkerSVG (): string {
  const fillColor = '#38891e'
  const strokeColor = '#ffffff'

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 34.892337" height="40" width="30">
    <g transform="translate(-814.59595,-274.38623)">
      <g transform="matrix(1.1855854,0,0,1.1855854,-151.17715,-57.3976)">
        <path d="m 817.11249,282.97118 c -1.25816,1.34277 -2.04623,3.29881 -2.01563,5.13867 0.0639,3.84476 1.79693,5.3002 4.56836,10.59179 0.99832,2.32851 2.04027,4.79237 3.03125,8.87305 0.13772,0.60193 0.27203,1.16104 0.33416,1.20948 0.0621,0.0485 0.19644,-0.51262 0.33416,-1.11455 0.99098,-4.08068 2.03293,-6.54258 3.03125,-8.87109 2.77143,-5.29159 4.50444,-6.74704 4.56836,-10.5918 0.0306,-1.83986 -0.75942,-3.79785 -2.01758,-5.14062 -1.43724,-1.53389 -3.60504,-2.66908 -5.91619,-2.71655 -2.31115,-0.0475 -4.4809,1.08773 -5.91814,2.62162 z" style="fill:${fillColor};stroke:${strokeColor};"/>
        <circle r="3.0355" cy="288.25278" cx="823.03064" id="path3049" style="display:inline;fill:${strokeColor};"/>
      </g>
    </g>
  </svg>`
}
</script>

<style scoped>
.platform-map {
  height: 100%;
  width: 100%;
}

:deep(.platform-marker) {
  cursor: pointer;
}

:deep(.platform-marker svg) {
  display: block;
}

:deep(.platform-popup) {
  font-size: 14px;
  padding: 4px 8px;
}
</style>

<style>
@import 'maplibre-gl/dist/maplibre-gl.css';
</style>
