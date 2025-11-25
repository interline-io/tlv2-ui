<template>
  <div
    ref="mapelem"
    class="map"
    :style="{ width: width, height: height }"
  />
</template>

<script setup lang="ts">
import { Map as MaplibreMap, FullscreenControl, NavigationControl } from 'maplibre-gl'
import type { Feature } from 'geojson'
import { useBasemapLayers } from '../../../composables/useBasemapLayers'
import type { Station, Pathway } from './station'
import { PathwayModeIcons } from './pathway-icons'
import { onMounted, ref, watch } from 'vue'

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
  selectedPathways?: Pathway[]
  width?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  station: null,
  basemap: 'carto',
  zoom: 17,
  center: () => [0, 0] as [number, number],
  selectedPathways: () => [],
  width: '100%',
  height: '600px'
})

const mapelem = ref<HTMLElement>()
const ready = ref(false)
const map = ref<MaplibreMap | null>(null)
const levelLayers = ref<Record<number | string, string[]>>({})

watch(() => props.basemap, (cur, prev) => {
  map.value?.setLayoutProperty(prev, 'visibility', 'none')
  map.value?.setLayoutProperty(cur, 'visibility', 'visible')
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

watch(() => props.selectedPathways, () => {
  updateSelectedPathways()
})

onMounted(() => {
  initMap()
})

function addLevelLayer (levelId: number | string | null | undefined, layer: any) {
  if (!map.value?.getLayer(layer.id)) {
    map.value?.addLayer(layer)
    const lid = levelId ?? 'null'
    if (levelLayers.value[lid] === undefined) {
      levelLayers.value[lid] = []
    }
    levelLayers.value[lid].push(layer.id)
  }
}

function redraw () {
  drawLevels()
  drawPathways()
  drawStops()
}

function drawLevels () {
  if (!ready.value || !props.station) {
    return
  }
  const features: Feature[] = []
  for (const level of props.station.levels || []) {
    if (!level.geometry) {
      continue
    }
    features.push({ type: 'Feature', id: level.id, properties: { id: level.id }, geometry: level.geometry })
    addLevelLayer(level.id!,
      {
        id: `level-${level.id}-level`,
        type: 'fill',
        source: 'levels',
        layout: {},
        paint: {
          'fill-color': '#3bb2d0',
          'fill-outline-color': '#3bb2d0',
          'fill-opacity': 0.1
        },
        filter: ['==', level.id, ['get', 'id']]
      }
    )
    addLevelLayer(level.id!,
      {
        id: `level-${level.id}-level-outline`,
        type: 'line',
        source: 'levels',
        paint: {
          'line-color': '#3bb2d0',
          'line-width': 2
        },
        filter: ['==', level.id, ['get', 'id']]
      }
    )
  }
  (map.value?.getSource('levels') as any)?.setData({
    type: 'FeatureCollection',
    features
  })
}

function drawStops () {
  if (!ready.value || !props.station) {
    return
  }
  const lc: Record<number, string> = {}
  for (const [i, level] of props.station.levels.entries()) {
    lc[level.id!] = LEVEL_COLORS[i % LEVEL_COLORS.length]!
  }

  const allStops = props.station.stops
  for (const stop of allStops) {
    const levelId = stop.level?.id ?? null
    const levelIdStr = levelId !== null ? String(levelId) : 'null'
    const levelIdForFilter = levelId ?? -1
    const color = (levelId !== null ? lc[levelId]! : '#87a9ff')

    addLevelLayer(
      levelId,
      {
        id: `level-${levelIdStr}-stops-selected`,
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
        filter: ['==', levelIdForFilter, ['get', 'level_id']]
      }
    )
    addLevelLayer(
      levelId,
      {
        id: `level-${levelIdStr}-stops`,
        type: 'circle',
        source: 'stops',
        paint: {
          'circle-radius': 8,
          'circle-color': color
        },
        filter: ['==', levelId, ['get', 'level_id']]
      }
    )
    addLevelLayer(
      levelId,
      {
        id: `level-${levelId}-stops-text`,
        type: 'symbol',
        source: 'stops',
        layout: {
          'text-allow-overlap': true,
          'text-field': ['get', 'level_index'],
          'text-font': ['DIN Offc Pro Regular Sans Regular', 'Arial Unicode MS Regular'],
          'text-size': 10
        },
        filter: ['==', levelId, ['get', 'level_id']]
      }
    )
    addLevelLayer(
      levelId,
      {
        id: `level-${levelId}-stops-stop-name`,
        type: 'symbol',
        source: 'stops',
        layout: {
          'text-allow-overlap': true,
          'text-anchor': 'left',
          'text-field': ['get', 'stop_name'],
          'text-font': ['DIN Offc Pro Regular Sans Regular', 'Arial Unicode MS Regular'],
          'text-size': 12,
          'text-offset': [1.0, 0]
        },
        filter: ['==', levelId, ['get', 'level_id']]
      }
    )
  }

  const newStops = ({
    type: 'FeatureCollection',
    features: allStops.map((s) => {
      return {
        type: 'Feature',
        id: s.id,
        properties: {
          level_id: s.level ? s.level.id : null,
          level_index: s.level && s.level.level_index,
          stop_name: s.stop_name
        },
        geometry: s.geometry!
      }
    })
  }) as any

  (map.value?.getSource('stops') as any)?.setData(newStops)
}

function drawPathways () {
  if (!ready.value || !props.station) {
    return
  }

  for (const pw of props.station.pathways || []) {
    const levelId1 = pw.from_stop.level ? pw.from_stop.level.id : null
    addLevelLayer(
      levelId1,
      {
        id: `level-${levelId1}-pathway-selected`,
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
        filter: ['any', ['==', levelId1, ['get', 'from_level_id']], ['==', levelId1, ['get', 'to_level_id']]]
      }
    )
    addLevelLayer(
      levelId1,
      {
        id: `level-${levelId1}-pathway-type-same`,
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
          ['any', ['==', levelId1, ['get', 'from_level_id']], ['==', levelId1, ['get', 'to_level_id']]],
          [
            '==', ['get', 'from_level_id'], ['get', 'to_level_id']
          ]
        ]
      }
    )
    addLevelLayer(
      levelId1,
      {
        id: `level-${levelId1}-pathway-type-transition`,
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
          ['any', ['==', levelId1, ['get', 'from_level_id']], ['==', levelId1, ['get', 'to_level_id']]],
          [
            '!=', ['get', 'from_level_id'], ['get', 'to_level_id']
          ]
        ]
      }
    )
    addLevelLayer(
      levelId1,
      {
        id: `level-${levelId1}-pathway-icon`,
        type: 'symbol',
        source: 'pathwaysMidpoints',
        layout: {
          'icon-image': ['get', 'icon'],
          'icon-size': 0.25
        },
        filter: ['any', ['==', levelId1, ['get', 'from_level_id']], ['==', levelId1, ['get', 'to_level_id']]]
      }
    )
  }

  const midpoints = (props.station.pathways.map((s) => {
    return {
      type: 'Feature',
      id: s.id,
      properties: {
        description: 'ok',
        from_level_id: s.from_stop.level ? s.from_stop.level.id : null,
        to_level_id: s.to_stop.level ? s.to_stop.level.id : null,
        icon: PathwayModeIcons[s.pathway_mode!]?.icon
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [
          ((s.from_stop.geometry?.coordinates[0] ?? 0) + (s.to_stop.geometry?.coordinates[0] ?? 0)) / 2,
          ((s.from_stop.geometry?.coordinates[1] ?? 0) + (s.to_stop.geometry?.coordinates[1] ?? 0)) / 2
        ]
      }
    }
  })) as any[]

  (map.value?.getSource('pathwaysMidpoints') as any)?.setData({
    type: 'FeatureCollection',
    features: midpoints
  })

  const features = (props.station.pathways.map((s) => {
    return {
      type: 'Feature',
      id: s.id,
      properties: {
        from_stop_id: s.from_stop.id,
        to_stop_id: s.to_stop.id,
        level_id: s.from_stop.level ? s.from_stop.level.id : null,
        from_level_id: s.from_stop.level ? s.from_stop.level.id : null,
        to_level_id: s.to_stop.level ? s.to_stop.level.id : null,
        generated: s.generated || false
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          s.from_stop.geometry!.coordinates,
          s.to_stop.geometry!.coordinates
        ]
      }
    }
  })) as any[]

  (map.value?.getSource('pathways') as any)?.setData({
    type: 'FeatureCollection',
    features
  })

  updateSelectedPathways()
}

function updateSelectedPathways () {
  if (!ready.value) return

  // Clear all selections first
  const pathwayFeatures = props.station?.pathways || []
  for (const pw of pathwayFeatures) {
    map.value?.setFeatureState(
      { source: 'pathways', id: pw.id },
      { hover: false }
    )
  }

  // Set new selections
  for (const pw of (props.selectedPathways || [])) {
    map.value?.setFeatureState(
      { source: 'pathways', id: pw.id },
      { hover: true }
    )
  }
}

function initMap () {
  const sources: any = {}
  const layers: any[] = []

  // Add basemap layers
  const { basemapLayers } = useBasemapLayers()
  for (const [k, v] of Object.entries(basemapLayers.value)) {
    sources[k] = v.source
    layers.push(Object.assign({ id: k, source: k }, v.layer))
  }

  // Add station-specific sources
  sources.stops = { type: 'geojson', data: { type: 'FeatureCollection', features: [] } }
  sources.pathways = { type: 'geojson', data: { type: 'FeatureCollection', features: [] } }
  sources.pathwaysMidpoints = { type: 'geojson', data: { type: 'FeatureCollection', features: [] } }
  sources.levels = { type: 'geojson', data: { type: 'FeatureCollection', features: [] } }

  const mapValue = new MaplibreMap({
    container: mapelem.value!,
    center: props.center,
    zoom: props.zoom,
    scrollZoom: false,
    style: {
      version: 8,
      glyphs: '/fonts/{fontstack}/{range}.pbf',
      sources,
      layers: layers as any
    }
  })

  mapValue.addControl(new FullscreenControl())
  mapValue.addControl(new NavigationControl())
  mapValue.doubleClickZoom.disable()
  mapValue.getCanvas().style.cursor = 'default'

  // Load pathway icons before drawing
  mapValue.on('load', async () => {
    for (const icon of Object.values(PathwayModeIcons)) {
      const image = await mapValue.loadImage(`/icons/${icon.icon}.png`)
      mapValue.addImage(icon.icon, image.data)
    }
    ready.value = true
    redraw()
  })

  map.value = mapValue as any
}
</script>

<style>
@import 'maplibre-gl/dist/maplibre-gl';
</style>
