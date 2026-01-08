<template>
  <div
    id="map"
    ref="mapelem"
    class="map"
  />
</template>

<script setup lang="ts">
import { Map as MaplibreMap } from 'maplibre-gl'
import type { LngLat, MapLayerMouseEvent, PointLike } from 'maplibre-gl'
import { nextTick, ref, watch, onMounted } from 'vue'
import { useBasemapLayers } from '../../composables/useBasemapLayers'
import { PathwayModeIcons } from '../../lib/pathways/pathway-icons'
import type { Station, Stop, Pathway, Level } from './station'
import type { Feature, FeatureCollection, Point, LineString, MultiPolygon } from 'geojson'

function mapLevelKeyFn (level: Level | null | undefined): string {
  return `mapLevelKey-${level?.id || 'unassigned'}`
}

function distance (p1: PointLike, p2: PointLike): number {
  const px1 = Array.isArray(p1) ? p1[0] : p1.x
  const py1 = Array.isArray(p1) ? p1[1] : p1.y
  const px2 = Array.isArray(p2) ? p2[0] : p2.x
  const py2 = Array.isArray(p2) ? p2[1] : p2.y
  return ((px1 - px2) ** 2 + (py1 - py2) ** 2) ** 0.5
}

const LEVEL_COLORS = [
  '#d53e4f',
  '#fc8d59',
  '#fee08b',
  '#ffffbf',
  '#e6f598',
  '#99d594',
  '#3288bd'
]

interface Props {
  station?: Station | null
  basemap?: string
  zoom?: number
  center?: [number, number]
  otherStops?: Stop[]
  routes?: Feature[]
  selectedStops?: Stop[]
  selectedPathways?: Pathway[]
  selectedLevels?: string[]
  selectedPathwayTransitionTypes?: string
  selectedAgencies?: Array<{ id: number }> | null
  search?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  station: null,
  basemap: 'protomaps-grayscale',
  zoom: 17,
  center: () => [0, 0],
  otherStops: () => [],
  routes: () => [],
  selectedStops: () => [],
  selectedPathways: () => [],
  selectedLevels: () => [],
  selectedPathwayTransitionTypes: 'all',
  selectedAgencies: null,
  search: false
})

const emit = defineEmits<{
  'select-point': [lngLat: LngLat]
  'select-stop': [stopId: number]
  'select-pathway': [pathwayId: number]
  'move-stop-save': [stopId: number, lngLat: LngLat]
}>()

const mapelem = ref<HTMLDivElement | null>(null)
const ready = ref(false)
const map = ref<any>(null)
const levelLayers = ref<Record<string, string[]>>({})

function addLevelLayer (levelId: string, layer: any) {
  if (!map.value || map.value.getLayer(layer.id)) {
    return
  }
  map.value.addLayer(layer)
  if (levelLayers.value[levelId] === undefined) {
    levelLayers.value[levelId] = []
  }
  levelLayers.value[levelId].push(layer.id)
}

function redraw () {
  drawRoutes()
  drawLevels()
  drawPathways()
  drawStops()
}

function drawRoutes () {
  if (!ready.value || !map.value) {
    return
  }
  const features = props.routes
  const routeSource: any = map.value.getSource('routes')
  if (routeSource && routeSource.setData) {
    routeSource.setData({
      type: 'FeatureCollection',
      features
    } as FeatureCollection)
  }
  addLevelLayer('routes', {
    id: 'routes',
    type: 'line',
    source: 'routes',
    paint: {
      'line-color': ['get', 'stroke'],
      'line-width': ['get', 'stroke-width']
    }
  })
}

function drawLevels () {
  if (!ready.value || !props.station || !map.value) {
    return
  }
  const features: Feature<MultiPolygon>[] = []
  for (const level of props.station.levels || []) {
    if (!level.geometry) {
      continue
    }
    const mapLevelKey = mapLevelKeyFn(level)
    features.push({
      type: 'Feature',
      id: level.id,
      geometry: level.geometry,
      properties: {
        id: level.id,
        mapLevelKey
      }
    })
    addLevelLayer(mapLevelKey, {
      id: `${mapLevelKey}-level`,
      type: 'fill',
      source: 'levels',
      layout: {},
      paint: {
        'fill-color': '#3bb2d0',
        'fill-outline-color': '#3bb2d0',
        'fill-opacity': 0.1
      },
      filter: ['==', mapLevelKey, ['get', 'mapLevelKey']]
    })
    addLevelLayer(mapLevelKey, {
      id: `${mapLevelKey}-outline`,
      type: 'line',
      source: 'levels',
      paint: {
        'line-color': '#3bb2d0',
        'line-width': 2
      },
      filter: ['==', mapLevelKey, ['get', 'mapLevelKey']]
    })
  }
  const levelSource: any = map.value.getSource('levels')
  if (levelSource && levelSource.setData) {
    levelSource.setData({
      type: 'FeatureCollection',
      features
    } as FeatureCollection)
  }
}

function drawStops () {
  if (!ready.value || !props.station || !map.value) {
    return
  }
  console.log('drawing stops', props.station.stops, props.otherStops)

  // get geoms
  const allStops = [...props.station.stops, ...props.otherStops].filter(s => (s.location_type !== 1))
  const geoms: Record<number, [number, number]> = {}
  for (const stop of allStops) {
    if (stop.id && stop.geometry) {
      geoms[stop.id] = stop.geometry.coordinates as [number, number]
    }
  }

  // get layers
  const levelColors = new Map<string, string>()
  levelColors.set('mapLevelKey-unassigned', '#87a9ff')
  for (const [i, level] of (props.station.levels || []).entries()) {
    const color = LEVEL_COLORS[i % LEVEL_COLORS.length]
    if (color) {
      levelColors.set(mapLevelKeyFn(level), color)
    }
  }
  console.log('levelColors:', levelColors)

  for (const [mapLevelKey, color] of levelColors.entries()) {
    addLevelLayer(mapLevelKey, {
      id: `${mapLevelKey}-stops-selected`,
      type: 'circle',
      source: 'stops',
      paint: {
        'circle-radius': 16,
        'circle-color': '#00ff00',
        'circle-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          1,
          0.0
        ]
      },
      filter: ['==', mapLevelKey, ['get', 'mapLevelKey']]
    })
    addLevelLayer(mapLevelKey, {
      id: `${mapLevelKey}-stops-associations`,
      type: 'line',
      source: 'stops-associations',
      paint: {
        'line-color': '#e04aff',
        'line-opacity': 0.8,
        'line-width': 4
      },
      filter: ['==', mapLevelKey, ['get', 'mapLevelKey']]
    })
    addLevelLayer(mapLevelKey, {
      id: `${mapLevelKey}-stops`,
      type: 'circle',
      source: 'stops',
      paint: {
        'circle-radius': 8,
        'circle-color': color
      },
      filter: ['==', mapLevelKey, ['get', 'mapLevelKey']]
    })
    addLevelLayer(mapLevelKey, {
      id: `${mapLevelKey}-stops-text`,
      type: 'symbol',
      source: 'stops',
      layout: {
        'text-allow-overlap': true,
        'text-field': ['get', 'level_index'],
        'text-font': ['default'],
        'text-size': 10
      },
      filter: ['==', mapLevelKey, ['get', 'mapLevelKey']]
    })
    addLevelLayer(mapLevelKey, {
      id: `${mapLevelKey}-stops-stop-name`,
      type: 'symbol',
      source: 'stops',
      layout: {
        'text-allow-overlap': true,
        'text-anchor': 'left',
        'text-field': ['get', 'stop_name'],
        'text-font': ['default'],
        'text-size': 12,
        'text-offset': [1.0, 0]
      },
      filter: ['==', mapLevelKey, ['get', 'mapLevelKey']]
    })
    addLevelLayer(mapLevelKey, {
      id: `${mapLevelKey}-stops-parent-stations`,
      type: 'line',
      source: 'stops-parent-stations',
      paint: {
        'line-color': 'red',
        'line-opacity': 0.5,
        'line-width': 2
      },
      filter: ['==', mapLevelKey, ['get', 'mapLevelKey']]
    })
  }

  const newStops: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: allStops
      .filter(s => s.geometry)
      .map((s): Feature<Point> => {
        return {
          type: 'Feature',
          id: s.id,
          properties: {
            mapLevelKey: mapLevelKeyFn(s.level),
            level_id: s.level?.id || 0,
            level_index: s.level?.level_index,
            stop_name: s.external_reference?.target_active_stop?.stop_name || s.stop_name
          },
          geometry: s.geometry!
        }
      })
  }

  console.log('newStops:', newStops)
  const stopSource: any = map.value.getSource('stops')
  if (stopSource && stopSource.setData) {
    stopSource.setData(newStops)
  }
  console.log('stops source set')

  const stopParentStationGeoms: Feature<LineString>[] = allStops.filter((s) => {
    return s.parent?.id
      && s.parent?.id > 0
      && s.parent?.id !== props.station?.id
      && s.geometry?.coordinates
      && geoms[s.parent?.id]
  }).map((s): Feature<LineString> => {
    return {
      type: 'Feature',
      id: s.id,
      properties: {
        mapLevelKey: mapLevelKeyFn(s.level),
        level_id: s.level?.id || 0,
        level_index: s.level?.level_index,
        stop_name: s.stop_name
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          s.geometry!.coordinates,
          geoms[s.parent!.id!] || [0, 0]
        ]
      }
    }
  })
  const parentStationSource: any = map.value.getSource('stops-parent-stations')
  if (parentStationSource && parentStationSource.setData) {
    parentStationSource.setData({
      type: 'FeatureCollection',
      features: stopParentStationGeoms
    })
  }

  // Association geoms
  const stopAssociationGeoms: Feature<LineString>[] = allStops.filter((s) => {
    return s.external_reference?.target_active_stop
      && s.geometry
      && s.external_reference?.target_active_stop?.geometry
  }).map((s): Feature<LineString> => {
    return {
      type: 'Feature',
      id: s.id,
      properties: {
        mapLevelKey: mapLevelKeyFn(s.level),
        level_id: s.level?.id || 0,
        level_index: s.level?.level_index
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          s.geometry!.coordinates,
          s.external_reference!.target_active_stop!.geometry!.coordinates
        ]
      }
    }
  })
  console.log('stopAssociationGeoms:', stopAssociationGeoms)
  const associationSource: any = map.value.getSource('stops-associations')
  if (associationSource && associationSource.setData) {
    associationSource.setData({
      type: 'FeatureCollection',
      features: stopAssociationGeoms
    })
  }
}

function drawPathways () {
  if (!ready.value || !props.station || !map.value) {
    return
  }
  const pwLevels = new Map<string, boolean>()
  for (const pw of props.station.pathways || []) {
    pwLevels.set(mapLevelKeyFn(pw.from_stop.level), true)
  }
  for (const mapLevelKey1 of pwLevels.keys()) {
    addLevelLayer(mapLevelKey1, {
      id: `${mapLevelKey1}-pathway-selected`,
      type: 'line',
      source: 'pathways',
      paint: {
        'line-color': 'yellow',
        'line-width': 16,
        'line-opacity': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          1,
          0.0
        ]
      },
      filter: ['any', ['==', mapLevelKey1, ['get', 'fromMapLevelKey']], ['==', mapLevelKey1, ['get', 'toMapLevelKey']]]
    })
    addLevelLayer(mapLevelKey1, {
      id: `${mapLevelKey1}-pathway-type-same`,
      type: 'line',
      source: 'pathways',
      paint: {
        'line-color': 'blue',
        'line-opacity': [
          'case',
          ['==', ['get', 'generated'], true], 0.0,
          1.0
        ],
        'line-width': 4
      },
      filter: [
        'all',
        ['any', ['==', mapLevelKey1, ['get', 'fromMapLevelKey']], ['==', mapLevelKey1, ['get', 'toMapLevelKey']]],
        ['==', ['get', 'fromMapLevelKey'], ['get', 'toMapLevelKey']]
      ]
    })
    addLevelLayer(mapLevelKey1, {
      id: `${mapLevelKey1}-pathway-type-transition`,
      type: 'line',
      source: 'pathways',
      paint: {
        'line-color': 'red',
        'line-opacity': [
          'case',
          ['==', ['get', 'generated'], true], 0.0,
          1.0
        ],
        'line-width': 4
      },
      filter: [
        'all',
        ['any', ['==', mapLevelKey1, ['get', 'fromMapLevelKey']], ['==', mapLevelKey1, ['get', 'toMapLevelKey']]],
        ['!=', ['get', 'fromMapLevelKey'], ['get', 'toMapLevelKey']]
      ]
    })
    addLevelLayer(mapLevelKey1, {
      id: `${mapLevelKey1}-pathway-icon`,
      type: 'symbol',
      source: 'pathways-midpoints',
      layout: {
        'icon-image': ['get', 'icon'],
        'icon-size': 0.25
      },
      filter: ['any', ['==', mapLevelKey1, ['get', 'fromMapLevelKey']], ['==', mapLevelKey1, ['get', 'toMapLevelKey']]]
    })
  }

  // Add midpoints
  const midpoints: Feature<Point>[] = (props.station.pathways || []).map((s: Pathway): Feature<Point> => {
    return {
      type: 'Feature',
      id: s.id,
      properties: {
        description: 'ok',
        fromMapLevelKey: mapLevelKeyFn(s.from_stop?.level),
        toMapLevelKey: mapLevelKeyFn(s.to_stop?.level),
        icon: PathwayModeIcons[s.pathway_mode || 0]?.icon || 'default'
      },
      geometry: {
        type: 'Point',
        coordinates: [
          ((s.from_stop?.geometry?.coordinates[0] || 0) + (s.to_stop?.geometry?.coordinates[0] || 0)) / 2,
          ((s.from_stop?.geometry?.coordinates[1] || 0) + (s.to_stop?.geometry?.coordinates[1] || 0)) / 2
        ]
      }
    }
  })
  const midpointSource: any = map.value.getSource('pathways-midpoints')
  if (midpointSource && midpointSource.setData) {
    midpointSource.setData({
      type: 'FeatureCollection',
      features: midpoints
    })
  }

  // Add pathways
  const features: Feature<LineString>[] = (props.station.pathways || []).map((s: Pathway): Feature<LineString> => {
    return {
      type: 'Feature',
      id: s.id,
      properties: {
        from_stop_id: s.from_stop?.id,
        to_stop_id: s.to_stop?.id,
        mapLevelKey: mapLevelKeyFn(s.from_stop?.level),
        fromMapLevelKey: mapLevelKeyFn(s.from_stop?.level),
        toMapLevelKey: mapLevelKeyFn(s.to_stop?.level),
        generated: false
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          s.from_stop?.geometry?.coordinates || [0, 0],
          s.to_stop?.geometry?.coordinates || [0, 0]
        ]
      }
    }
  })
  const pathwaySource: any = map.value.getSource('pathways')
  if (pathwaySource && pathwaySource.setData) {
    pathwaySource.setData({
      type: 'FeatureCollection',
      features
    })
  }

  // Force redraw of selection
  for (const i of (props.selectedPathways || [])) {
    map.value.setFeatureState(
      { source: 'pathways', id: i.id },
      { hover: true }
    )
  }
}

const { basemapLayers } = useBasemapLayers()

function initMap () {
  if (map.value) {
    return
  }
  const sources: Record<string, any> = {}
  const layers: any[] = []
  for (const [k, v] of Object.entries(basemapLayers.value)) {
    sources[k] = v.source
    layers.push({ id: k, source: k, ...v.layer })
  }
  map.value = new MaplibreMap({
    container: mapelem.value as HTMLDivElement,
    center: props.center,
    zoom: props.zoom,
    style: {
      version: 8,
      glyphs: '/fonts/{fontstack}/{range}.pbf',
      sources,
      layers
    }
  })
  if (!map.value) return
  map.value.doubleClickZoom.disable()
  map.value.getCanvas().style.cursor = 'default'
  if (props.search) {
    // Geocoder support commented out
  }
  // Load images, defer drawing map until loaded
  map.value.on('load', async () => {
    if (!map.value) return
    for (const icon of Object.values(PathwayModeIcons)) {
      const image2 = await map.value.loadImage(`/icons/${icon.icon}.png`)
      map.value.addImage(icon.icon, image2.data)
    }
    drawMap()
  })
}

function drawMap () {
  if (!map.value) return
  // Sources
  map.value.addSource('stops', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] }
  })
  map.value.addSource('stops-parent-stations', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] }
  })
  map.value.addSource('stops-associations', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] }
  })
  map.value.addSource('pathways', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] }
  })
  map.value.addSource('pathways-midpoints', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] }
  })
  map.value.addSource('levels', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] }
  })
  map.value.addSource('routes', {
    type: 'geojson',
    data: { type: 'FeatureCollection', features: [] }
  })

  // Actions
  map.value.on('click', (e: MapLayerMouseEvent) => {
    emit('select-point', e.lngLat)
  })
  map.value.on('click', (e: MapLayerMouseEvent) => {
    if (!map.value) return
    const features = map.value.queryRenderedFeatures(e.point)
      .filter((f: any) => f.source === 'stops' || f.source === 'pathways')
    if (features.length === 0) {
      return
    }
    const feature = features[0]
    if (feature && feature.source === 'stops' && typeof feature.id === 'number') {
      emit('select-stop', feature.id)
    } else if (feature && feature.source === 'pathways' && typeof feature.id === 'number') {
      emit('select-pathway', feature.id)
    }
  })
  map.value.on('mousedown', (e: MapLayerMouseEvent) => {
    if (!map.value || !props.station) return
    // Get the top most stop
    const features = map.value.queryRenderedFeatures(e.point)
      .filter((f: any) => f.source === 'stops' || f.source === 'pathways')
    if (features.length === 0) {
      return
    }
    const feature = features[0]
    if (!feature || feature.source !== 'stops') {
      return
    }
    // Prevent the default map drag behavior.
    e.preventDefault()
    const dragStartPoint = e.point
    // Get reference to update geometry
    let dragStop: Stop | null = null
    for (const stop of props.station.stops) {
      if (stop.id === feature.id) {
        dragStop = stop
      }
    }
    if (!dragStop) {
      return
    }
    if (!props.selectedStops.map(s => s.id).includes(dragStop.id)) {
      return
    }
    const mouseMove = (e: MapLayerMouseEvent) => {
      const d = distance(dragStartPoint, e.point)
      if (d < 10) {
        return
      }
      if (dragStop && dragStop.geometry) {
        dragStop.geometry.coordinates = [e.lngLat.lng, e.lngLat.lat]
        drawStops()
        drawPathways()
      }
    }
    map.value.on('mousemove', mouseMove)
    map.value.once('mouseup', (e: MapLayerMouseEvent) => {
      const dragEndPoint = e.point
      const d = distance(dragStartPoint, dragEndPoint)
      if (d > 10 && dragStop && typeof dragStop.id === 'number') {
        emit('move-stop-save', dragStop.id, e.lngLat)
      }
      map.value?.off('mousemove', mouseMove)
    })
  })
  // Redraw
  ready.value = true
  redraw()
}

// Watchers
watch(() => props.basemap, (cur, prev) => {
  if (!map.value || !prev) return
  map.value.setLayoutProperty(prev, 'visibility', 'none')
  map.value.setLayoutProperty(cur, 'visibility', 'visible')
})

watch(() => props.selectedStops, (cur, prev) => {
  if (!map.value) return
  for (const i of (prev || [])) {
    map.value.setFeatureState(
      { source: 'stops', id: i.id },
      { hover: false }
    )
  }
  for (const i of (cur || [])) {
    map.value.setFeatureState(
      { source: 'stops', id: i.id },
      { hover: true }
    )
  }
})

watch(() => props.selectedPathways, (cur, prev) => {
  if (!map.value) return
  for (const i of (prev || [])) {
    map.value.setFeatureState(
      { source: 'pathways', id: i.id },
      { hover: false }
    )
  }
  for (const i of (cur || [])) {
    map.value.setFeatureState(
      { source: 'pathways', id: i.id },
      { hover: true }
    )
  }
})

watch(() => props.selectedLevels, () => {
  if (!map.value) return
  const strids = props.selectedLevels
  for (const [levelId, layerIds] of Object.entries(levelLayers.value)) {
    const vis = strids.includes(levelId) ? 'visible' : 'none'
    const spt = props.selectedPathwayTransitionTypes
    for (const k of layerIds) {
      map.value.setLayoutProperty(k, 'visibility', vis)
      if (k.startsWith(levelId + '-pathway-type')) {
        if (spt === 'same' && !k.startsWith(levelId + '-pathway-type-' + spt)) {
          map.value.setLayoutProperty(k, 'visibility', 'none')
        }
        if (spt === 'transition' && !k.startsWith(levelId + '-pathway-type-' + spt)) {
          map.value.setLayoutProperty(k, 'visibility', 'none')
        }
      }
    }
  }
})

watch(() => props.selectedAgencies, () => {
  drawStops()
})

watch(() => props.station?.pathways, () => {
  drawPathways()
})

watch(() => props.station?.levels, () => {
  drawLevels()
})

watch(() => props.station?.stops, () => {
  drawStops()
})

watch(() => props.otherStops, () => {
  drawStops()
})

watch(() => props.routes, () => {
  drawRoutes()
})

onMounted(() => {
  nextTick(() => { initMap() })
})
</script>

<style scoped>
#map {
  height: 800px;
}
</style>
