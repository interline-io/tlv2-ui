<template>
  <div class="bbox-select-map-wrapper">
    <div ref="mapContainer" class="bbox-select-map" />
    <div class="selection-box-overlay">
      <div
        ref="selectionBox"
        class="selection-box"
        :style="{ width: boxWidth + 'px', height: boxHeight + 'px' }"
      >
        <div class="selection-box-shade top" />
        <div class="selection-box-shade right" />
        <div class="selection-box-shade bottom" />
        <div class="selection-box-shade left" />
        <div
          class="selection-handle top-left"
          @mousedown="startDrag($event, 'top-left')"
        />
        <div
          class="selection-handle bottom-right"
          @mousedown="startDrag($event, 'bottom-right')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { Map as MapLibreMap, NavigationControl } from 'maplibre-gl'
import type { LngLatLike } from 'maplibre-gl'
import { useBasemapLayers } from '../../../composables/useBasemapLayers'

interface Props {
  modelValue?: string | null
}

withDefaults(defineProps<Props>(), {
  modelValue: null
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'setCustomBbox': [bbox: string]
}>()

const mapContainer = ref<HTMLElement>()
const selectionBox = ref<HTMLElement>()
const map = ref<MapLibreMap | null>(null)
const zoom = 15
const center: [number, number] = [-122.2711, 37.8044]

// Selection box dimensions (in pixels)
const boxWidth = ref(200)
const boxHeight = ref(150)

// Dragging state
const isDragging = ref(false)
const dragHandle = ref<string | null>(null)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragStartWidth = ref(0)
const dragStartHeight = ref(0)

function initMap (): void {
  if (!mapContainer.value) return

  const { basemapLayers } = useBasemapLayers()
  const basemaps = basemapLayers.value

  const mapValue = new MapLibreMap({
    container: mapContainer.value,
    center: center as LngLatLike,
    zoom,
    style: {
      version: 8,
      sources: {
        carto: basemaps.carto.source
      },
      layers: [
        {
          id: 'carto',
          source: 'carto',
          ...basemaps.carto.layer
        }
      ]
    }
  } as any)

  mapValue.addControl(new NavigationControl(), 'top-right')

  // Disable scroll zoom around mouse cursor, use center-based zoom instead
  mapValue.scrollZoom.disable()

  // Add custom scroll zoom that centers on the bbox
  mapContainer.value.addEventListener('wheel', (e: WheelEvent) => {
    e.preventDefault()

    if (!map.value) return

    // Get current bbox center
    const center = map.value.getCenter()

    // Zoom in or out based on wheel direction
    const delta = -e.deltaY
    const zoomDelta = delta > 0 ? 0.5 : -0.5

    map.value.easeTo({
      zoom: map.value.getZoom() + zoomDelta,
      center,
      duration: 200
    })
  }, { passive: false })

  mapValue.on('load', () => {
    mapValue!.resize()
  })

  // Update bbox whenever map moves
  mapValue.on('move', updateBounds)
  mapValue.on('zoom', updateBounds)

  map.value = mapValue as any
}

function startDrag (e: MouseEvent, handle: string) {
  e.preventDefault()
  e.stopPropagation()

  isDragging.value = true
  dragHandle.value = handle
  dragStartX.value = e.clientX
  dragStartY.value = e.clientY
  dragStartWidth.value = boxWidth.value
  dragStartHeight.value = boxHeight.value

  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('mouseup', onDragEnd)
}

function onDragMove (e: MouseEvent) {
  if (!isDragging.value || !dragHandle.value) return

  const deltaX = e.clientX - dragStartX.value
  const deltaY = e.clientY - dragStartY.value

  if (dragHandle.value === 'bottom-right') {
    boxWidth.value = Math.max(50, dragStartWidth.value + deltaX)
    boxHeight.value = Math.max(50, dragStartHeight.value + deltaY)
  } else if (dragHandle.value === 'top-left') {
    boxWidth.value = Math.max(50, dragStartWidth.value - deltaX)
    boxHeight.value = Math.max(50, dragStartHeight.value - deltaY)
  }
}

function onDragEnd () {
  isDragging.value = false
  dragHandle.value = null

  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)

  updateBounds()
}

function updateBounds () {
  if (!map.value || !mapContainer.value) return

  const mapElement = mapContainer.value
  const mapWidth = mapElement.clientWidth
  const mapHeight = mapElement.clientHeight

  // Calculate center point and bbox corners in pixels
  const centerX = mapWidth / 2
  const centerY = mapHeight / 2

  const left = centerX - boxWidth.value / 2
  const right = centerX + boxWidth.value / 2
  const top = centerY - boxHeight.value / 2
  const bottom = centerY + boxHeight.value / 2

  // Convert pixel coordinates to lat/lng
  const topLeft = map.value.unproject([left, top])
  const bottomRight = map.value.unproject([right, bottom])

  // Format: minLng,minLat,maxLng,maxLat
  const bbox = [
    topLeft.lng.toFixed(3),
    bottomRight.lat.toFixed(3),
    bottomRight.lng.toFixed(3),
    topLeft.lat.toFixed(3)
  ].join(',')

  emit('update:modelValue', bbox)
  emit('setCustomBbox', bbox)
}

// Watch for external dimension changes
watch([boxWidth, boxHeight], () => {
  updateBounds()
})

onMounted(() => {
  initMap()
})

onBeforeUnmount(() => {
  map.value?.remove()
  map.value = null
})
</script>

<style scoped>
.bbox-select-map-wrapper {
  position: relative;
  height: 800px;
  width: 100%;
}

.bbox-select-map {
  height: 100%;
  width: 100%;
}

.selection-box-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.selection-box {
  position: relative;
  border: 2px dashed #088;
  pointer-events: none;
  background: transparent;
}

.selection-box-shade {
  position: absolute;
  background: rgba(0, 0, 0, 0.4);
  pointer-events: none;
}

.selection-box-shade.top {
  top: -400px;
  left: -2000px;
  right: -2000px;
  height: 400px;
}

.selection-box-shade.bottom {
  bottom: -400px;
  left: -2000px;
  right: -2000px;
  height: 400px;
}

.selection-box-shade.left {
  top: 0;
  bottom: 0;
  left: -2000px;
  width: 2000px;
}

.selection-box-shade.right {
  top: 0;
  bottom: 0;
  right: -2000px;
  width: 2000px;
}

.selection-handle {
  position: absolute;
  width: 14px;
  height: 14px;
  background: #fff;
  border: 1px solid #666;
  box-shadow: 1px 1px rgba(0, 0, 0, 0.2);
  pointer-events: all;
  z-index: 10;
}

.selection-handle.top-left {
  top: -7px;
  left: -7px;
  cursor: nwse-resize;
}

.selection-handle.bottom-right {
  bottom: -7px;
  right: -7px;
  cursor: nwse-resize;
}
</style>

<style>
@import 'maplibre-gl/dist/maplibre-gl.css';
</style>
