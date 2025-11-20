<template>
  <div id="mapelem" ref="mapelem" :class="props.mapClass" />
</template>

<script setup lang="ts">
import * as maplibre from 'maplibre-gl'
import { noLabels, labels } from 'protomaps-themes-base'
import { nextTick, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useApiEndpoint } from '../composables/useApiEndpoint'
import { useAuthHeaders } from '../composables/useAuthHeaders'
import { useRuntimeConfig } from '#imports'
import mapLayers from './map-layers'
import type { LonLat, Feature, BoundingBox } from '../geom'

// Define types for better TypeScript support
interface MarkerCoord {
  lng: number
  lat: number
}

interface MarkerObject {
  lng: number
  lat: number
  onDragEnd?: (event: any) => void
}

interface TileSource {
  url: string
  id?: string
  minzoom?: number
  maxzoom?: number
}

interface MapViewerProps {
  hideTiles?: boolean
  markerCoords?: MarkerCoord[]
  markers?: MarkerObject[]
  enableScrollZoom?: boolean
  showProblematicGeometries?: boolean
  showGeneratedGeometries?: boolean
  mapClass?: string
  routeTiles?: TileSource | null
  stopTiles?: TileSource | null
  stopLocationTypeFilter?: Record<number, boolean>
  stopFeatures?: Feature[]
  routeFeatures?: Feature[]
  interactive?: boolean
  autoFit?: boolean
  center?: LonLat | null
  circleRadius?: number
  circleColor?: string
  zoom?: number | null
  hash?: boolean
  features?: Feature[]
}
// Define props using defineProps with defaults
const props = withDefaults(defineProps<MapViewerProps>(), {
  hideTiles: false,
  markerCoords: () => [],
  markers: () => [],
  enableScrollZoom: false,
  showProblematicGeometries: true,
  showGeneratedGeometries: true,
  mapClass: 'short',
  routeTiles: null,
  stopTiles: null,
  stopLocationTypeFilter: () => ({ 0: true, 1: true, 2: true, 3: true, 4: true }),
  stopFeatures: () => [],
  routeFeatures: () => [],
  interactive: true,
  autoFit: true,
  center: null,
  circleRadius: 1,
  circleColor: '#f03b20',
  zoom: 4,
  hash: false,
  features: () => []
})
// Reactive state
const map = ref<maplibre.Map | null>(null)
const hovering = ref<any[]>([])
const hoveringStops = ref<any[]>([])
const markerLayer = ref<maplibre.Marker[]>([])

// Template ref
const mapelem = ref<HTMLElement>()

// Get config at top level
const config = useRuntimeConfig()

// Create a once function utility
const once = <T extends (...args: any[]) => any>(fn: T): T => {
  let called = false
  return ((...args: any[]) => {
    if (!called) {
      called = true
      return fn(...args)
    }
  }) as T
}

// Define emits
const emit = defineEmits<{
  mapClick: [event: any]
  setZoom: [zoom: number]
  mapMove: [data: { zoom: number, bbox: BoundingBox }]
  setAgencyFeatures: [features: any]
  setStopFeatures: [features: any]
}>()

// Helper functions
const nextTickUpdateFeatures = (v: any) => {
  if (v) {
    nextTick(() => {
      updateFeatures()
    })
  }
}

const updateFilters = () => {
  if (!map.value) return

  for (const v of mapLayers.stopLayers) {
    const f = (v.filter || []).slice()
    if (f.length === 0) {
      f.push('all')
    }
    // Hide all stops if tiles are hidden
    if (props.hideTiles) {
      f.push(['==', 'stop_id', ''])
    }
    // Filter by location_type
    const enabledLocationTypes = Object.entries(props.stopLocationTypeFilter)
      .filter(([_, enabled]) => enabled)
      .map(([type, _]) => Number.parseInt(type))

    if (enabledLocationTypes.length < 5) { // Only add filter if not all types are enabled
      if (enabledLocationTypes.length > 0) {
        f.push(['in', ['get', 'location_type'], ['literal', enabledLocationTypes]])
      } else {
        // If no location types are enabled, hide all stops
        f.push(['==', 'stop_id', ''])
      }
    }

    if (f.length > 1) {
      map.value.setFilter(v.name, f as any)
    } else {
      map.value.setFilter(v.name, null)
    }
  }

  for (const v of mapLayers.routeLayers) {
    const f = (v.filter || []).slice()
    if (f.length === 0) {
      f.push('all')
    }
    // Hide all routes?
    if (props.hideTiles) {
      f.push(['==', 'route_id', ''])
    }

    // Hide geometries with long max segment lengths
    if (!props.showProblematicGeometries) {
      f.push(['any', ['==', 'generated', true], ['<', 'geometry_max_segment_length', 50 * 1000]])
      f.push(['any', ['==', 'generated', false], ['<', 'geometry_max_segment_length', 5 * 1000]])
    }
    // Hide generated geometries
    if (!props.showGeneratedGeometries) {
      f.push(['==', 'generated', false])
    }
    if (f.length > 1) {
      map.value.setFilter(v.name, f as any)
    } else {
      map.value.setFilter(v.name, null)
    }
  }
}

// Watchers
watch(() => props.hideTiles, () => {
  updateFilters()
})

watch(() => props.showProblematicGeometries, () => {
  updateFilters()
})

watch(() => props.showGeneratedGeometries, () => {
  updateFilters()
})

watch(() => props.stopLocationTypeFilter, () => {
  updateFilters()
}, { deep: true })

watch(() => props.features, (v) => {
  nextTickUpdateFeatures(v)
})

watch(() => props.stopFeatures, (v) => {
  nextTickUpdateFeatures(v)
})

watch(() => props.routeFeatures, (v) => {
  nextTickUpdateFeatures(v)
})

watch(() => props.center, (newVal, oldVal) => {
  if (oldVal?.toString() === newVal?.toString()) {
    return
  }
  if (map.value && props.center) {
    map.value.jumpTo({ center: [props.center.lon, props.center.lat], zoom: props.zoom })
  }
})

watch(() => props.zoom, () => {
  if (map.value && props.center) {
    map.value.jumpTo({ center: [props.center.lon, props.center.lat], zoom: props.zoom })
  }
})

watch(() => props.markers, (v) => {
  drawMarkers(v)
})
// Lifecycle hooks
onMounted(() => {
  if (props.features) {
    nextTick(() => { initMap() })
  }
})

onBeforeUnmount(() => {
  if (map.value) {
    map.value.remove()
  }
})
// Methods converted to functions
const saveImage = () => {
  if (!map.value) return
  const canvas = map.value.getCanvas()
  const fileName = 'image'
  const link = document.createElement('a')
  link.download = fileName + '.png'
  canvas.toBlob(function (blob) {
    if (blob) {
      link.href = URL.createObjectURL(blob)
      link.click()
    }
  })
}
const initMap = async () => {
  if (map.value) {
    return
  }
  const apiBase = useApiEndpoint()
  const authHeaders = await useAuthHeaders()

  const opts: any = {
    hash: props.hash,
    interactive: props.interactive,
    preserveDrawingBuffer: true,
    container: mapelem.value,
    style: {
      glyphs: 'https://cdn.protomaps.com/fonts/pbf/{fontstack}/{range}.pbf',
      version: 8,
      sources: {
        'protomaps-base': {
          type: 'vector',
          tiles: [`https://api.protomaps.com/tiles/v2/{z}/{x}/{y}.pbf?key=${(config.public.tlv2 as any)?.protomapsApikey}`],
          maxzoom: 14,
          attribution: '<a href="https://www.transit.land/terms">Transitland</a> | <a href="https://protomaps.com">Protomaps</a> | &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }
      },
      layers: noLabels('protomaps-base', 'grayscale')
    },
    transformRequest: (url: string, resourceType: string) => {
      if (resourceType === 'Tile' && url.startsWith(apiBase)) {
        return { url: url, headers: authHeaders, credentials: 'include' }
      }
    }
  }
  if (props.center) {
    opts.center = [props.center.lon, props.center.lat]
  }
  if (props.zoom) {
    opts.zoom = props.zoom
  }

  // Enable RTL text plugin for proper Hebrew and Arabic text rendering
  // Use local file to avoid ESM module resolution issues and external CDN dependency
  once(() => {
    maplibre.setRTLTextPlugin('/js/mapbox-gl-rtl-text.js', null as any)
  })
  const newMap = new maplibre.Map(opts)
  map.value = newMap
  newMap.addControl(new maplibre.FullscreenControl())
  newMap.addControl(new maplibre.NavigationControl())
  markerLayer.value = []
  if (!props.enableScrollZoom) {
    newMap.scrollZoom.disable()
  }
  drawMarkers(props.markers)
  newMap.on('load', () => {
    createSources()
    createLayers()
    updateFeatures()
    fitFeatures()
    map.value!.on('mousemove', mapMouseMove)
    map.value!.on('click', mapClick)
    map.value!.on('zoom', mapZoom)
    map.value!.on('moveend', mapMove)
    map.value!.resize()
  })
}
const updateFeatures = () => {
  if (!map.value) return

  const polygons = props.features.filter(s => s.geometry.type === 'MultiPolygon' || s.geometry.type === 'Polygon')
  const points = props.features.filter(s => s.geometry.type === 'Point')
  const lines = props.features.filter(s => s.geometry.type === 'LineString')

  // check if map is initialized... TODO: this could be improved to try again
  const p = map.value.getSource('polygons')
  if (!p) {
    return
  }

  const polygonSource = map.value.getSource('polygons') as maplibre.GeoJSONSource
  const linesSource = map.value.getSource('lines') as maplibre.GeoJSONSource
  const pointsSource = map.value.getSource('points') as maplibre.GeoJSONSource

  polygonSource.setData({ type: 'FeatureCollection', features: polygons as any })
  linesSource.setData({ type: 'FeatureCollection', features: lines as any })
  pointsSource.setData({ type: 'FeatureCollection', features: points as any })

  fitFeatures()
}

const createSources = () => {
  if (!map.value) return

  map.value.addSource('polygons', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] }
  })
  map.value.addSource('lines', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] }
  })
  map.value.addSource('points', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] }
  })
  // Add route/stop sources, with geojson features as fallbacks
  if (props.routeTiles) {
    map.value.addSource('routes', {
      type: 'vector',
      tiles: [props.routeTiles.url],
      minzoom: props.routeTiles.minzoom || 0,
      maxzoom: props.routeTiles.maxzoom || 14,
    })
  } else {
    map.value.addSource('routes', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: props.routeFeatures as any }
    })
  }
  if (props.stopTiles) {
    map.value.addSource('stops', {
      type: 'vector',
      tiles: [props.stopTiles.url],
      minzoom: props.stopTiles.minzoom || 0,
      maxzoom: props.stopTiles.maxzoom || 14,
    })
  } else {
    map.value.addSource('stops', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: props.stopFeatures as any }
    })
  }
}
const createLayers = () => {
  if (!map.value) return

  // Other feature layers
  map.value.addLayer({
    id: 'polygons',
    type: 'fill',
    source: 'polygons',
    layout: {},
    paint: {
      'fill-color': '#ccc',
      'fill-opacity': 0.2
    }
  })
  map.value.addLayer({
    id: 'polygons-outline',
    type: 'line',
    source: 'polygons',
    layout: {},
    paint: {
      'line-width': 2,
      'line-color': '#000',
      'line-opacity': 0.2
    }
  })
  map.value.addLayer({
    id: 'points',
    type: 'circle',
    source: 'points',
    paint: {
      'circle-color': ['coalesce', ['get', 'marker-color'], props.circleColor],
      'circle-radius': ['coalesce', ['get', 'marker-radius'], props.circleRadius],
      'circle-opacity': 0.4
    }
  })
  map.value.addLayer({
    id: 'lines',
    type: 'line',
    source: 'lines',
    layout: {},
    paint: {
      'line-color': ['coalesce', ['get', 'stroke'], '#000'],
      'line-width': ['coalesce', ['get', 'stroke-width'], 2],
      'line-opacity': 1.0
    }
  })
  // Route/Stop layers
  for (const v of mapLayers.routeLayers) {
    const layer: any = {
      id: v.name,
      type: 'line',
      source: 'routes',
      layout: {
        'line-cap': 'round',
        'line-join': 'round'
      },
      minzoom: v.minzoom || 0,
      paint: v.paint
    }
    if (props.routeTiles) {
      layer['source-layer'] = props.routeTiles.id
    }
    if (v.filter) {
      layer.filter = v.filter.slice()
    }
    map.value.addLayer(layer)
  }
  for (const v of mapLayers.stopLayers) {
    const layer: any = {
      id: v.name,
      type: 'circle',
      source: 'stops',
      paint: v.paint
    }
    if (props.stopTiles) {
      layer['source-layer'] = props.stopTiles.id
    }
    if (v.filter) {
      layer.filter = v.filter.slice()
    }
    map.value.addLayer(layer)
  }
  // add labels last
  for (const labelLayer of labels('protomaps-base', 'grayscale')) {
    map.value.addLayer(labelLayer)
  }
  // Set initial show generated geometry
  updateFilters()
}

const drawMarkers = (markers: MarkerObject[]) => {
  if (!map.value) return

  for (const m of markerLayer.value) {
    m.remove()
  }
  markerLayer.value = []

  for (const m of markers) {
    const newMarker = new maplibre.Marker().setLngLat([m.lng, m.lat]).addTo(map.value as any)
    if (m.onDragEnd) {
      newMarker.on('dragend', m.onDragEnd)
    }
    (markerLayer.value as any).push(newMarker)
  }
}
const fitFeatures = () => {
  if (!map.value) return

  const coords: number[][] = []
  for (const f of [...props.features, ...props.routeFeatures, ...props.stopFeatures]) {
    const g = f.geometry
    if (g.type === 'Point') {
      coords.push(g.coordinates)
    } else if (g.type === 'LineString') {
      for (const c of g.coordinates) {
        coords.push(c)
      }
    } else if (g.type === 'Polygon') {
      for (const a of g.coordinates) {
        for (const b of a) {
          coords.push(b)
        }
      }
    } else if (g.type === 'MultiLineString') {
      for (const a of g.coordinates) {
        for (const b of a) {
          coords.push(b)
        }
      }
    }
  }
  if (props.autoFit && coords.length > 0) {
    const bounds = coords.reduce(function (bounds, coord) {
      return bounds.extend(coord as [number, number])
    }, new maplibre.LngLatBounds(coords[0] as [number, number], coords[0] as [number, number]))
    map.value.fitBounds(bounds, {
      duration: 0,
      padding: 20,
      maxZoom: 14
    })
  }
}
const mapClick = (e: any) => {
  emit('mapClick', e)
}

const mapZoom = () => {
  if (map.value) {
    emit('setZoom', map.value.getZoom())
  }
}

const mapMove = () => {
  if (map.value) {
    const bbox = {
      sw: { lon: map.value.getBounds().getSouthWest().lng, lat: map.value.getBounds().getSouthWest().lat },
      ne: { lon: map.value.getBounds().getNorthEast().lng, lat: map.value.getBounds().getNorthEast().lat }
    }
    emit('mapMove', { zoom: map.value.getZoom(), bbox })
  }
}

const mapMouseMove = (e: any) => {
  if (!map.value) return
  const searchWidth = 0
  const searchHeight = 0
  const searchBbox: [[number, number], [number, number]] = [
    [e.point.x - searchWidth / 2, e.point.y - searchHeight / 2],
    [e.point.x + searchWidth / 2, e.point.y + searchHeight / 2]
  ]
  const currentMap = map.value
  const features = currentMap.queryRenderedFeatures(searchBbox, { layers: ['route-active'] })
  const stopFeatures = currentMap.queryRenderedFeatures(searchBbox, { layers: ['stop-active'] })

  // Set cursor based on whether we're hovering over routes or stops
  if (features.length > 0 || stopFeatures.length > 0) {
    currentMap.getCanvas().style.cursor = 'pointer'
  } else {
    currentMap.getCanvas().style.cursor = ''
  }

  // Handle route hovers
  for (const k of hovering.value) {
    currentMap.setFeatureState(
      { source: 'routes', id: k, sourceLayer: props.routeTiles?.id },
      { hover: false }
    )
  }
  hovering.value = []

  for (const v of features) {
    hovering.value.push(v.id)
    currentMap.setFeatureState({ source: 'routes', id: v.id, sourceLayer: props.routeTiles?.id }, { hover: true })
  }

  const agencyFeatures: any = {}
  for (const v of features) {
    const agencyId = v.properties.agency_name
    const routeId = v.properties.route_id
    if (agencyFeatures[agencyId] == null) {
      agencyFeatures[agencyId] = {}
    }
    agencyFeatures[agencyId][routeId] = v.properties
  }
  emit('setAgencyFeatures', agencyFeatures)

  // Handle stop hovers
  for (const k of hoveringStops.value) {
    currentMap.setFeatureState(
      { source: 'stops', id: k, sourceLayer: props.stopTiles?.id },
      { hover: false }
    )
  }
  hoveringStops.value = []

  // Set hover state for stops
  for (const v of stopFeatures) {
    hoveringStops.value.push(v.id)
    currentMap.setFeatureState(
      { source: 'stops', id: v.id, sourceLayer: props.stopTiles?.id },
      { hover: true }
    )
  }

  // Emit stop features grouped by feed
  const groupedStopFeatures: any = {}
  for (const v of stopFeatures) {
    const feedId = v.properties.feed_onestop_id || 'unknown'
    if (groupedStopFeatures[feedId] == null) {
      groupedStopFeatures[feedId] = []
    }
    groupedStopFeatures[feedId].push(v.properties)
  }
  emit('setStopFeatures', groupedStopFeatures)
}

// Expose the saveImage method so it can be called from parent components
defineExpose({
  saveImage
})
</script>

<style scss>
@import 'maplibre-gl/dist/maplibre-gl';
.short {
  height: 600px;
}
.tall {
  height: calc(100vh - 60px);
}
</style>
