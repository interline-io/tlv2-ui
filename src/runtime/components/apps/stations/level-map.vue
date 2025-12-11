<template>
  <div>
    <div ref="mapelem" :style="elemstyle" class="map" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { Map as MaplibreMap, AttributionControl } from 'maplibre-gl'
import { useBasemapLayers } from '../../../composables/useBasemapLayers'
import { PeliasIcons } from './basemaps'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import type { Feature, Point, LineString, Polygon, MultiPolygon } from 'geojson'

// https://github.com/maplibre/maplibre-gl-js/issues/2601
const drawClasses: any = MapboxDraw.constants.classes
drawClasses.CONTROL_BASE = 'maplibregl-ctrl'
drawClasses.CONTROL_PREFIX = 'maplibregl-ctrl-'
drawClasses.CONTROL_GROUP = 'maplibregl-ctrl-group'

interface DrawControls {
  point?: boolean
  line_string?: boolean
  polygon?: boolean
  trash?: boolean
  combine_features?: boolean
  uncombine_features?: boolean
}

interface Props {
  basemap?: string
  width?: string
  height?: string
  showAttribution?: boolean
  drawTools?: boolean
  drawControls?: DrawControls
  drawDefaultMode?: string
  center?: [number, number]
  points?: Point[]
  lines?: LineString[]
  polygons?: Array<Polygon | MultiPolygon>
  opacity?: number
  lineWidth?: number
  polygonOutlineWidth?: number
  editableFeatures?: Feature[]
  zoom?: number
  search?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  basemap: 'carto',
  width: '100px',
  height: '100px',
  showAttribution: true,
  drawTools: false,
  drawControls: () => ({
    point: false,
    line_string: false,
    polygon: false,
    trash: false,
    combine_features: false,
    uncombine_features: false
  }),
  drawDefaultMode: 'simple_select',
  center: () => [-122.431297, 37.773972],
  points: () => [],
  lines: () => [],
  polygons: () => [],
  opacity: 0.5,
  lineWidth: 16.0,
  polygonOutlineWidth: 2.0,
  editableFeatures: () => [],
  zoom: 12,
  search: false
})

const emit = defineEmits<{
  changed: [features: any]
}>()

const mapelem = ref<HTMLDivElement | null>(null)
const map = ref<any>(null)
const draw = ref<any>(null)

const elemstyle = computed(() => ({
  width: props.width,
  height: props.height
}))

function changed () {
  if (draw.value) {
    emit('changed', draw.value.getAll())
  }
}

const { basemapLayers } = useBasemapLayers()

function initMap () {
  if (!mapelem.value) return

  const sources: Record<string, any> = {}
  const layers: any[] = []
  for (const [k, v] of Object.entries(basemapLayers.value)) {
    sources[k] = v.source
    layers.push({ id: k, source: k, ...v.layer })
  }

  map.value = new MaplibreMap({
    interactive: props.drawTools,
    container: mapelem.value as unknown as HTMLElement,
    center: props.center,
    zoom: props.zoom,
    attributionControl: false,
    style: {
      version: 8,
      glyphs: '/fonts/{fontstack}/{range}.pbf',
      sources,
      layers
    }
  })

  if (!map.value) return

  map.value.doubleClickZoom.disable()

  if (props.showAttribution) {
    map.value.addControl(new AttributionControl(), 'bottom-left')
  }

  if (props.drawTools) {
    draw.value = new MapboxDraw({
      displayControlsDefault: false,
      controls: props.drawControls,
      defaultMode: props.drawDefaultMode
    })
    map.value.addControl(draw.value)
  }

  if (props.search) {
    // Geocoder support commented out
  }

  map.value.on('draw.create', changed)
  map.value.on('draw.delete', changed)
  map.value.on('draw.update', changed)

  map.value.on('load', async () => {
    if (!map.value) return
    for (const icon of Object.values(PeliasIcons)) {
      const image2 = await map.value.loadImage(`/icons/${icon.icon}.png`)
      map.value.addImage(icon.icon, image2.data)
    }
    drawMap()
  })
}

function redraw () {
  if (!map.value) return
  const lineSource: any = map.value.getSource('lines')
  if (lineSource && lineSource.setData) {
    lineSource.setData({
      type: 'FeatureCollection',
      features: (props.lines || []).map((p): Feature<LineString> => {
        return { type: 'Feature', properties: {}, geometry: p }
      })
    })
  }
}

function drawMap () {
  if (!map.value) return

  map.value.addSource('points', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: (props.points || []).map((p): Feature<Point> => {
        return { type: 'Feature', properties: {}, geometry: p }
      })
    }
  })

  map.value.addSource('lines', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })

  map.value.addSource('polygons', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: (props.polygons || []).map((p): Feature<Polygon | MultiPolygon> => {
        return { type: 'Feature', properties: {}, geometry: p }
      })
    }
  })

  map.value.addLayer({
    id: 'polygons',
    type: 'fill',
    source: 'polygons',
    layout: {},
    paint: {
      'fill-color': '#3bb2d0',
      'fill-opacity': 0.1
    }
  })

  map.value.addLayer({
    id: 'polygon-outlines',
    type: 'line',
    source: 'polygons',
    paint: {
      'line-color': '#3bb2d0',
      'line-width': props.polygonOutlineWidth,
      'line-opacity': props.opacity
    }
  })

  map.value.addLayer({
    id: 'lines',
    type: 'line',
    source: 'lines',
    paint: {
      'line-color': '#f58488',
      'line-width': props.lineWidth
    }
  })

  map.value.addLayer({
    id: 'points',
    type: 'circle',
    source: 'points',
    paint: {
      'circle-opacity': props.opacity,
      'circle-radius': 8,
      'circle-color': '#d53e4f'
    }
  })

  if (draw.value) {
    draw.value.add({
      type: 'FeatureCollection',
      features: props.editableFeatures
    })
  }
}

// Watchers
watch(() => props.basemap, (cur, prev) => {
  if (!map.value || !prev) return
  map.value.setLayoutProperty(prev, 'visibility', 'none')
  map.value.setLayoutProperty(cur, 'visibility', 'visible')
})

watch(() => props.lines, () => {
  redraw()
})

onMounted(() => {
  nextTick(() => { initMap() })
})
</script>

<style scoped>
.map {
  position: relative;
}
</style>
